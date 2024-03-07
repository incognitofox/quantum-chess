import React, { useState, useEffect } from 'react';

import { Chessboard } from "react-chessboard";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import { QuantumChess } from '../game-engine.js'

export function QuantumBoard() {
    const [gameOne, setGameOne] = useState(new QuantumChess());
    const [gameTwo, setGameTwo] = useState(new QuantumChess());
    const [turn, setTurn] = useState(true)
    const [gameStart, setGameStart] = useState(false);


    useEffect(() => {
        if (gameStart) {
            console.log("random playing")
            setTimeout(makeRandomMove, 200);
        }
    }, [turn, gameStart]);

    const startGame = React.useCallback(() => setGameStart(true), []);

    function notationToSquare(not) {
        return [8 - parseInt(not.slice(-1)), 'abcdefgh'.indexOf(not.slice(-2,-1))]
    }

    function removePiece(origin, game, setGame) {
        game.removePiece(origin)
        setGame(new QuantumChess(game.fen(), game.getOrigins(), game.getPos()));
    }

    function makeAMove(move) {
        if (!gameStart) {
            startGame();
        }

        const game = turn ? gameOne : gameTwo;
        const otherGame = turn ? gameTwo : gameOne;
        const setGame = turn ? setGameOne : setGameTwo;
        const setOtherGame = turn ? setGameTwo : setGameOne;

        let result = null;
        try {
            const move_string = typeof move == "string" ? move : move.to;
            const square = notationToSquare(move_string);
            console.log(`square: ${square}`)
            const piece = game.board()[square[0]][square[1]];
            const tmp = piece ? piece.square : "no piece"
            console.log(`piece?: ${tmp}`)
            console.log(game.getOrigins())
            const origin = piece ? game.getOrigin(piece.square) : null;
            result = game.quantumMove(move);
            if (!piece) {
                console.log("empty")
            } else {
                console.log(piece)
                console.log("captured")
                removePiece(origin, otherGame, setOtherGame);
            }
        } catch (e) {
            console.log(e)
            console.log(`invalid move: ${move}`)
        }
        setGame(new QuantumChess(game.fen(), game.getOrigins(), game.getPos()));
        return result; // null if the move was illegal, the move object if the move was legal
    }

    function makeRandomMove() {
        const game = turn ? gameOne : gameTwo
        const possibleMoves = game.moves({ verbose: true });
        if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0)
          return; // exit if the game is over
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        makeAMove(possibleMoves[randomIndex]);
      }

    function onDrop(sourceSquare, targetSquare) {
        const move = makeAMove({
            from: sourceSquare,
            to: targetSquare,
        });

        // illegal move
        if (move === null) return false;
        setTurn(!turn);
        return true;
    }
    
    return (
        <Container md={4}>
            <Row>
                <Col>
                    <Chessboard 
                        id="board-1" 
                        position={gameOne.fen()} 
                        boardWidth={500} 
                        onPieceDrop={onDrop}
                    />
                </Col>
                <Col>
                    <Chessboard 
                        id="board-2" 
                        position={gameTwo.fen()} 
                        boardWidth={500} 
                        boardOrientation='black' 
                        onPieceDrop={onDrop}
                    />
                </Col>
            </Row>
        </Container>
    )
}
