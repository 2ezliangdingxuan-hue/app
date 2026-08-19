import { Header } from "~/header/header"
import {pieces, colours} from "~/page/pieces"
import { board } from "~/page/board"
import { useState, useEffect } from "react"

const initialPieces = [
    { name: "I", shape: pieces.I },
    { name: "O", shape: pieces.O },
    { name: "T", shape: pieces.T },
    { name: "S", shape: pieces.S },
    { name: "Z", shape: pieces.Z },
    { name: "L", shape: pieces.L },
    { name: "J", shape: pieces.J },
];

export default function page(){
        
    const [items, setItems] = useState(()=>initialPieces)
    const [queue, setQueue] = useState(()=>items)
    const [curPiece, setCurPiece] = useState(()=>items[0])
    const [piecePos, setPiecePos] = useState(()=>({x: 3, y: 0}))
    
    
    const getBoard = () => {
        const gameBoard = board.Default.map(row => [...row])
        if(curPiece && piecePos){
            curPiece.shape.forEach((row,dy) => {
                row.forEach((cell, dx) =>{
                    if (cell === 1){
                        const boardY = piecePos.y + dy;
                        const boardX = piecePos.x + dx;
                        if(boardY >=0 && boardX >= 0 && boardX < gameBoard[0].length){
                            gameBoard[boardY][boardX] = 1;
                        }
                    }
                })
            })
        }
        return gameBoard;
    }

    const gameBoard = getBoard();

    //collision
    const canPlace=(
        piece: typeof curPiece, 
        x: number, 
        y: number, 
        boardState: typeof gameBoard) =>{
        for (let dy = 0; dy < piece.shape.length; dy++){
            for(let dx = 0; dx < piece.shape[dy].length; dx++){
                const bx = x + dx;
                const by = y + dy;

                if (bx < 0 || bx >= 10 || by >=20) return false;
                if (by >= 0 && boardState[by][bx] !== 0) return false;
            }
        }
        return true;
    }

    //gravity
    useEffect(()=>{
        const gameLoop = setInterval (()=>{
            setPiecePos(prev => {
                const newY = prev.y + 1;

                if (canPlace(curPiece, prev.x, newY, board.Default)){
                    return {...prev, y: newY};
                } else{
                    handleLockPiece();
                    return prev;
                }
            });
        }, 500);
        return () => clearInterval(gameLoop);
    }, [curPiece]);

    //srs
    const rotate = (piece: typeof curPiece)=>{
        const n = piece.shape.length;
        const rotated = Array(piece.shape[0].length)
        .fill(null)
        .map((_,i) =>
            piece.shape.map(row=> row[i]).reverse()
        )
    }
    
    const handleLockPiece = () => {

    }

    const handleShuffle = () =>{
        let shuffled = [...initialPieces];

        for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
        return shuffled;
    }

    const handleAddQueue = () => {
        if(queue.length === 7){
            const newItems = handleShuffle();
            setQueue(prevQueue => [ ...prevQueue,...newItems]);
        }
    }

    const handlePopQueue = () =>{
        
        setQueue(currentQueue => {
            setCurPiece(currentQueue[0]);
            return currentQueue.slice(1);
        })
        handleAddQueue();
    }

    useEffect(()=>{
        const shuffled = handleShuffle();
        setQueue(shuffled)
        handleAddQueue();
    },[]);

    

    const shuffledPieces = queue.slice(0, 6).map(({name,shape},pieceIndex)=>
        <div key={`${name}-${pieceIndex}`}className="space-x-3">
            {shape.map((shape,shapeIndex)=>
            <div key={shapeIndex} className="flex">
                {shape.map((cell,cellIndex)=>(
                    <div key={cellIndex} style={{
                        backgroundColor: 
                        cell === 1 ?
                        colours[name as keyof typeof colours] : 'transparent',
                        border: 
                        cell === 1 ?
                        '1px solid' : ''
                    }}
                    className="h-4 w-4">
                        {/* {cell} */}
                    </div>
                ))}
            </div>
            )}
        </div>
    )
    const curPieceUI = curPiece && (
        <div key={curPiece.name} className="space-x-3">
            {curPiece.shape.map((shape,shapeIndex)=>
            <div key={shapeIndex} className="flex">
                {shape.map((cell,cellIndex)=>(
                    <div key={cellIndex} style={{
                        backgroundColor: 
                        cell === 1 ?
                        colours[curPiece.name as keyof typeof colours] : 'transparent',
                        border: 
                        cell === 1 ?
                        '1px solid' : ''
                    }}
                    className="h-4 w-4">
                        {/* {cell} */}
                    </div>
                ))}
            </div>
            )}
        </div>
    )
    
    
    return(
        <>
        <Header/>
        <div className="p-8 flex flex-col">
            <h1 className="text-3xl font-bold mb-8">Page</h1>
            <div className="flex gap-3">
            <div className="flex flex-col">
                <button onClick={handlePopQueue} className="mb-3 border">
                    Shuffle List
                </button>
                 <div className="gap-3 flex flex-row mb-3">
                    {curPieceUI}
                </div>
                <div>
                    {gameBoard.map((row, rowIndex) =>(
                    <div key={rowIndex} className="flex">
                        {row.map((cell, cellIndex)=>
                            <div key={cellIndex} className="border h-4 w-4">
                                {cell}
                            </div>
                        )}
                    </div>
                ))}
                </div>
            </div>
                <div className="flex flex-col gap-3">
                    <p> NEXT: </p>
                    {shuffledPieces}
                </div>
            </div>
            <div className="mt-3">
                <button className="border">
                    New
                </button>
            </div>
        </div>
        </>
    )
}