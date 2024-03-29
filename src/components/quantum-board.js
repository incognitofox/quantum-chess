import React, { useState, useEffect } from 'react';

import { Chessboard } from "react-chessboard";

import { Navbar, Container, Row, Col, Nav, Modal, Button } from 'react-bootstrap';

import { QuantumChess } from '../game-engine.js'

export function QuantumBoard() {
    const [gameOne, setGameOne] = useState(new QuantumChess());
    const [gameTwo, setGameTwo] = useState(new QuantumChess());
    const [turn, setTurn] = useState(true)
    const [gameStart, setGameStart] = useState(false);
    const [show, setShow] = useState(true);

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
    
    function handleClick() {
        setTurn(true);
        setGameStart(false);
        setGameOne(new QuantumChess());
        setGameTwo(new QuantumChess());
    }

    function toggleModal() {
        setShow(!show);
    }

    return (
        <>
            <Modal show={show} onHide={toggleModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Instructions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Welcome to QuantumChess! This works exactly like regular chess with the following modifications:
                    <ol>
                        <li>You control two boards, and alternate making moves on each board, starting with the right board.</li>
                        <li>When you capture a piece, the corresponding piece on the other board is also captured.</li>
                    </ol>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={toggleModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Navbar bg="dark" data-bs-theme="dark">
                <Nav className="me-auto" >
                    <Nav.Link onClick={handleClick}>New Game</Nav.Link>
                    <Nav.Link onClick={toggleModal}>Instructions</Nav.Link>
                    <Nav.Link>Quantum Background</Nav.Link>
                </Nav>
                <Nav>
                    <Nav.Link href="https://github.com/incognitofox/quantum-chess" target='_blank'>Source</Nav.Link>
                </Nav>
            </Navbar>
            <Container className='mt-5' md={4}>
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
        </>
    )
}
