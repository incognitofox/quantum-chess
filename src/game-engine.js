import { Chess } from 'chess.js'

function moveToSquare(move_string) {
    const pos = /[a-h]\d/.exec(move_string)[0]
    return [8 - parseInt(pos.slice(-1)), 'abcdefgh'.indexOf(pos.slice(-2,-1))]
}

function squareToNot(square) {
    const alpha = "abcdefgh"
    return alpha[square[1]] + (8 - square[0]).toString();
}

export class QuantumChess extends Chess { 
    constructor(fen, origins, positions) {
        super(fen);
        if (origins && positions) {
            this.origin_to_position = origins;
            this.position_to_origin = positions;
        }
        else {
            this.origin_to_position = new Map();
            this.position_to_origin = new Map();
            for(var i = 0; i < 8; i ++) {
                for(var j = 0; j < 8; j ++) {
                    const square = this.board()[i][j];
                    if (square) {
                        this.origin_to_position.set(square.square, square.square)
                        this.position_to_origin.set(square.square, square.square)
                    }
                }

            }
        }
    }

    getOrigins() {
        return this.origin_to_position;
    }

    getPos() {
        return this.position_to_origin;
    }

    getOrigin(pos) {
        return this.position_to_origin.get(pos);
    }

    quantumMove(move) {
        console.log(move);
        this.move(move);
        const src_string = typeof move == "string" ? move : move.from;
        const src_square = moveToSquare(src_string);

        const dest_string = typeof move == "string" ? move : move.to;
        const dest_square = moveToSquare(dest_string);

        const src_not = squareToNot(src_square);
        const dest_not = squareToNot(dest_square);

        const origin = this.position_to_origin.get(src_not);

        console.log(`origin: ${origin} src: ${src_not} dest: ${dest_not}`)

        this.position_to_origin.delete(src_not);

        this.origin_to_position.set(origin, dest_not)
        this.position_to_origin.set(dest_not, origin)
        
        return true;
    }
 
    removePiece(origin) {
        console.log(`origin: ${origin}`)
        const pos = this.origin_to_position.get(origin);
        console.log(`pos: ${pos}`);
        const pos_string = typeof pos == "string" ? pos : pos.to;
        console.log(`removed: ${this.remove(pos_string)}$`);
        console.log(this.board())
        this.position_to_origin.delete(pos);
        this.origin_to_position.delete(origin);
    }
}