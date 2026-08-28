import { Header } from "~/header/header"
import {pieces, colours} from "~/page/pieces"
import { board } from "~/page/board"
import { useState, useEffect, useRef } from "react"
import { kicks, iKicks } from "~/page/kicks"

const initialPieces: { name: keyof typeof colours; shape: number[][] }[] = [
    { name: "I", shape: pieces.I },
    { name: "O", shape: pieces.O },
    { name: "T", shape: pieces.T },
    { name: "S", shape: pieces.S },
    { name: "Z", shape: pieces.Z },
    { name: "L", shape: pieces.L },
    { name: "J", shape: pieces.J },
];

const delay = (ms: number) => new Promise((resolve)=> setTimeout(resolve, ms))

// const clockwiseKicks = {
//     kicks: [
//         "0>R",
//         "R>2",
//         "2>L",
//         "L>0",
//     ]
// }
// const counterclockwiseKicks = {
//     kicks: [
//         "R>0",
//         "2>R",
//         "L>2",
//         "0>L",
//     ]
// }

const states = ["0", "R", "2", "L"]

type BoardCell = 0 | keyof typeof colours;

const createEmptyBoard = (): BoardCell[][] =>
    board.Default.map(row => row.map(() => 0 as BoardCell));

export default function page(){
    
    const defaultPos = ({x:3, y:18})
    const overPos = ({x:3, y:19})
    const [items, setItems] = useState(()=>initialPieces)
    const [queue, setQueue] = useState(()=>items)
    const [curPiece, setCurPiece] = useState(()=>items[0])
    const [piecePos, setPiecePos] = useState(()=>(defaultPos))
    const [boardState, setBoardState] = useState<BoardCell[][]>(createEmptyBoard);
    const [holdPiece, setHoldPiece] = useState<typeof curPiece|null>(null);
    const [holdState, setHoldState] = useState(false);
    const [playingState, setPlayingState] = useState(true)
    const [pieceState, setPieceState] = useState("0")

    const stateRef = useRef({
        curPiece, piecePos, boardState, playingState, pieceState
    })

    stateRef.current={
        curPiece, piecePos, boardState, playingState, pieceState
    }
    
    const handleRotatePieceState = (direction:number) =>{
        const index = states.indexOf(pieceState)
        const startState = pieceState
        //canPlace(curPiece,piecePos.x, piecePos.y,boardState)
        if(direction === 1){ //clockwise
            const nextIndex = (index + 1) % states.length;
            //console.log(startState+">"+states[nextIndex])

            const table = startState+">"+states[nextIndex]

            const rotated = rotateClockwise(curPiece)

            if (canPlace(rotated, piecePos.x, piecePos.y, boardState)){
                setCurPiece(rotated);
                setPieceState(states[nextIndex])
                return;
            }

            if(!table) return;
            const kicksTable = kicks[table as keyof typeof kicks]

            for(const kick of kicksTable){
                if(canPlace(rotated, piecePos.x + kick.x, piecePos.y+kick.y, boardState)){
                    setCurPiece(rotated);
                    setPiecePos(p => ({x: p.x + kick.x, y: p.y+kick.y}));
                    setPieceState(states[nextIndex])
                    return;
                }
            }
        }
        else if (direction === 0){ //counter clockwise
            const prevIndex = (index - 1 + states.length) % states.length;
            //console.log(startState+">"+states[prevIndex])
            const table = startState+">"+states[prevIndex]

            const rotated = rotateCounterClockwise(curPiece)

            if (canPlace(rotated, piecePos.x, piecePos.y, boardState)){
                setCurPiece(rotated);
                setPieceState(states[prevIndex])
                return;
            }

            if(!table) return;
            const kicksTable = kicks[table as keyof typeof kicks]

            for(const kick of kicksTable){
                if(canPlace(rotated, piecePos.x + kick.x, piecePos.y+kick.y, boardState)){
                    setCurPiece(rotated);
                    setPiecePos(p => ({x: p.x + kick.x, y: p.y+kick.y}));
                    setPieceState(states[prevIndex])
                    return;
                }
            }
            
        }
    }

    const handleHoldPiece = () =>{
        setPieceState("0");
        const newHoldPiece: typeof curPiece | null = items.find(item => item.name === curPiece.name) ?? null
        if (holdPiece === null && holdState === false){
            setHoldPiece(newHoldPiece)
            handlePopQueue(); 
            setHoldState(true);
        }
        else if (holdPiece !== null && holdState === false){
            setCurPiece(holdPiece)
            setHoldPiece(newHoldPiece)
            setHoldState(true);
        }
        setPiecePos(defaultPos);
    }

    const handleStart = () =>{
        setPlayingState(true);
    }

    const handleStop = () =>{
        setPlayingState(false);
    }

    const handleNewGame = (event: React.MouseEvent<HTMLButtonElement>) =>{
        setPieceState("0");
        handleStart();
        setHoldPiece(null);
        setBoardState(createEmptyBoard)
        const shuffled = handleShuffle();
        const nextBatch = handleShuffle();
        setQueue([...shuffled.slice(1), ...nextBatch]);
        setCurPiece(shuffled[0]);
        event.currentTarget.blur();
    }

    const handleTopOut = () =>{
            curPiece.shape.forEach((row,dy) => {
            row.forEach((cell,dx) =>{
                if (cell !== 1) return;

                const boardY = overPos.y + dy;
                const boardX = overPos.x + dx;

                if (boardY !== 0 || boardX !== 0){
                    handleStop();
                }
            });
        });
    }


    const getBoard = () => {
        const gameBoard = boardState.map(row => [...row])
        if(curPiece && piecePos){
            curPiece.shape.forEach((row, dy) => {
                row.forEach((cell, dx) =>{
                    if (cell === 1){
                        const boardY = piecePos.y + dy;
                        const boardX = piecePos.x + dx;
                        if(boardY >=0 && boardX >= 0 && boardX < gameBoard[0].length && boardY<gameBoard.length){
                            gameBoard[boardY][boardX] = curPiece.name;
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
                if(piece.shape[dy][dx] === 0) continue;
                const bx = x + dx;
                const by = y + dy;

                if (bx < 0 || bx >= boardState[0].length || by >= boardState.length) return false;
                if (by >= 0 && boardState[by][bx] !== 0) return false;
            }
        }
        return true;
    }

    //gravity
    // useEffect(()=>{
    //     if (!playingState) return;
    //     const gameLoop = setInterval (()=>{
    //         const newY = piecePos.y + 1;

    //         if (canPlace(curPiece, piecePos.x, newY, boardState)){
    //             setPiecePos(prev => ({...prev, y: newY}));
    //         } else {
    //             handleLockPiece();
    //         }
    //     }, 500);
    //     return () => clearInterval(gameLoop);
    
    // }, [curPiece, boardState, piecePos]);

    //gravity
    useEffect(()=>{
        if (!playingState) return;
        const gameLoop = setInterval (()=>{
            const { curPiece, piecePos, boardState } = stateRef.current;
            const newY = piecePos.y + 1;

            if (canPlace(curPiece, piecePos.x, newY, boardState)){
                setPiecePos(prev => ({...prev, y: newY}));
            } else {
                setTimeout(() => {
                    handleLockPiece();
                }, 500);
            }
        }, 500);
        return () => clearInterval(gameLoop);
    
    }, [playingState]);

    //rotate 90 clockwise
    const rotateClockwise = (piece: typeof curPiece)=>{
        const rotated = Array(piece.shape[0].length)
        .fill(null)
        .map((_,i) =>
            piece.shape.map(row=> row[i]).reverse()
        )
        return {...piece, shape: rotated}
    }

    //rotate 90 counter clockwise
    const rotateCounterClockwise = (piece: typeof curPiece)=>{
        const rotated = Array(piece.shape[0].length)
        .fill(null)
        .map((_,i) =>
            piece.shape.map(row=> row[row.length-1-i])
        )
        return {...piece, shape: rotated}
    }

    //rotation system
    const handleRotateClockwise = () =>{
        
        const table = handleRotatePieceState(1);

        // const rotated = rotateClockwise(curPiece)

        // if (canPlace(rotated, piecePos.x, piecePos.y, boardState)){
        //     setCurPiece(rotated);
        //     return;
        // }

        // if(!table) return;
        // const kicksTable = kicks[table as keyof typeof kicks]

        // for(const kick of kicksTable){
        //     if(canPlace(rotated, piecePos.x + kick.x, piecePos.y+kick.y, boardState)){
        //         setCurPiece(rotated);
        //         setPiecePos(p => ({x: p.x + kick.x, y: p.y+kick.y}));
        //         return;
        //     }
        // }
    }

    const handleRotateCounterClockwise = () =>{
        
        const table = handleRotatePieceState(0);
    }
    
    //move left or right
    const handleMove = (direction: number) =>{
        const newX = piecePos.x + direction;
        if (canPlace(curPiece, newX, piecePos.y, boardState)){
            setPiecePos(p=>({...p, x: newX}));
        }
    };


    //harddrop
    const hardDrop = () => {
        let newY = piecePos.y
        while(canPlace(curPiece, piecePos.x, newY, boardState)){
            newY+=1;
        }
        setPiecePos(p=>({...p, y: newY-1}))
        
       handleLockPos(newY)
    }

    const handleLockPos = (newY: number) =>{
         const lockedBoard = boardState.map(row => [...row]);
        curPiece.shape.forEach((row,dy) => {
            row.forEach((cell,dx) =>{
                if (cell !== 1) return;

                const boardY = newY + dy - 1;
                const boardX = piecePos.x + dx;

                if(
                    boardY >= 0 && 
                    boardY < lockedBoard.length &&
                    boardX >= 0 && 
                    boardX < lockedBoard[0].length
                ){
                    lockedBoard[boardY][boardX] = curPiece.name;
                }
            });
        });

        const clearedBoard = lockedBoard.filter(
            row => !row.every(cell => cell !== 0)
        );

        while (clearedBoard.length < board.Default.length){
            clearedBoard.unshift(Array(10).fill(0));
        }

        setBoardState(clearedBoard);
        handlePopQueue();

        if(holdState){
            setHoldState(false)
        }
        
        setPiecePos(defaultPos);
        return;
    }
    const softIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dasIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const handleSoftDrop = () =>{
        let newY = piecePos.y
        
        if (!softIntervalRef.current){
            softIntervalRef.current = setInterval(()=>{
            newY += 1;
            if (canPlace(curPiece, piecePos.x, newY, boardState)){
                setPiecePos(prev => ({...prev, y: newY}));
            } else {
                clearInterval(softIntervalRef.current!);
                softIntervalRef.current = null;
                setTimeout(() => {
                    handleLockPos(newY);
                }, 500);
                return;
            }
        },40)}
    }

    const stopSoftDrop = ()=>{
        if(softIntervalRef.current){
            clearInterval(softIntervalRef.current)
            softIntervalRef.current = null;
        }
    }

    const handleDas = (direction: number) =>{
        //let newY = piecePos.y
        
        let newX = piecePos.x;
        // if (canPlace(curPiece, newX, piecePos.y, boardState)){
        //     setPiecePos(p=>({...p, x: newX}));
        // }
        handleMove(direction);

        if (!dasIntervalRef.current){
            dasIntervalRef.current = setInterval(()=>{
            newX += direction;
            if (canPlace(curPiece, newX, piecePos.y, boardState)){
                setPiecePos(prev => ({...prev, x: newX}));
                
            } else {
                clearInterval(dasIntervalRef.current!);
                dasIntervalRef.current = null;
                //handleLockPos(newX);
                return;
            }
        },50)}
    }

    const stopDas = ()=>{
        if(dasIntervalRef.current){
            clearInterval(dasIntervalRef.current)
            dasIntervalRef.current = null;
        }
    }

    //check kb inputs
    useEffect(()=>{
        if (!playingState) return;
        const handleKey = (e: KeyboardEvent) =>{
            if (e.key === 'ArrowLeft') handleDas(-1)
            if (e.key === 'ArrowRight') handleDas(1)
            if (e.key === 'ArrowUp') handleRotateClockwise()
            if (e.key === 'ArrowDown') handleSoftDrop()
            if (e.key === 'z') handleRotateCounterClockwise()
            if (e.key === ' ') {hardDrop()}
            if (e.key === 'Shift') handleHoldPiece();
        }
        const handleKeyUp = (e: KeyboardEvent) =>{
            if (e.key === 'ArrowDown') stopSoftDrop()
            if (e.key === 'ArrowLeft') stopDas()
            if (e.key === 'ArrowRight') stopDas()
        }
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('keyup', handleKeyUp);
        }
        
    }, [piecePos, curPiece])

    //set piece position
    const handleLockPiece = () => {
        const { curPiece, piecePos, boardState } = stateRef.current;
        const lockedBoard = boardState.map(row => [...row]);
        curPiece.shape.forEach((row,dy) => {
            row.forEach((cell,dx) =>{
                if (cell !== 1) return;

                const boardY = piecePos.y + dy;
                const boardX = piecePos.x + dx;

                if(
                    boardY >= 0 && boardY < lockedBoard.length &&
                    boardX >= 0 && boardX < lockedBoard[0].length
                ){
                    lockedBoard[boardY][boardX] = curPiece.name;
                    //console.log("Y: " + boardY + " X: " + boardX)
                }
            });
        });

        const clearedBoard = lockedBoard.filter(
            row => !row.every(cell => cell !== 0)
        );

        while (clearedBoard.length < board.Default.length){
            clearedBoard.unshift(Array(10).fill(0));
        }

        setBoardState(clearedBoard);
        handlePopQueue();

        if(holdState){
            setHoldState(false)
        }
        setPiecePos(defaultPos);
    }



    //shuffle pieces
    const handleShuffle = () =>{
        let shuffled = [...initialPieces];

        for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
        return shuffled;
    }

    //remove pieces from queue and change cur piece
    const handlePopQueue = () =>{
        if (!playingState) return;
        setPieceState("0");
        const nextPiece = queue[0];
        let nextQueue = queue.slice(1);

        if (nextQueue.length === 7){
            const newItems = handleShuffle();
            nextQueue = [...nextQueue, ...newItems];
        }
        
        if(!canPlace(nextPiece, overPos.x, overPos.y, boardState)){
            handleStop();
            return;
        }
        setCurPiece(nextPiece);
        //handleTopOut()
        //console.log(curPiece.name)
        setQueue(nextQueue);
    }

    //starting stuff
    useEffect(()=>{
        const shuffled = handleShuffle();
        const nextBatch = handleShuffle();
        setQueue([...shuffled.slice(1), ...nextBatch]);
        setCurPiece(shuffled[0]);
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
    const holdPieceUI = holdPiece && (
        <div key={holdPiece.name} className="space-x-3">
            {holdPiece.shape.map((shape,shapeIndex)=>
            <div key={shapeIndex} className="flex">
                {shape.map((cell,cellIndex)=>(
                    <div key={cellIndex} style={{
                        backgroundColor: 
                        cell === 1 ?
                        colours[holdPiece.name as keyof typeof colours] : 'transparent',
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
                        {/* {curPieceUI} */}
                    </div>
                    <div className="flex flex-row">
                        <div className="flex mr-4 mt-16 border border-slate-300 h-10 w-20 items-center justify-center">
                            {holdPieceUI}
                        </div>
                        <div>
                             {gameBoard.slice(16,20).map((row, rowIndex) =>(
                            <div key={rowIndex} className="flex">
                                {row.map((cell, cellIndex)=>
                                    <div key={cellIndex} className=" h-4 w-4"
                                    style={{
                                        backgroundColor:
                                            cell === 0 ? "transparent" : colours[cell],
                                        border: 
                                            cell !== 0 ?
                                        '1px solid' : ''
                                    }}>
                                        {/* {cell} */}
                                    </div>
                                )}
                            </div>
                        ))}
                            {gameBoard.slice(20,40).map((row, rowIndex) =>(
                            <div key={rowIndex} className="flex">
                                {row.map((cell, cellIndex)=>
                                    <div key={cellIndex} className="border h-4 w-4"
                                    style={{
                                        backgroundColor:
                                            cell === 0 ? "transparent" : colours[cell]
                                    }}>
                                        {/* {cell} */}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="mt-3 flex flex-row justify-between">
                            <button onClick={handleNewGame} className="border">
                                New
                            </button>
                            <div>
                                {String(playingState)}
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <p> NEXT: </p>
                    {shuffledPieces}
                </div>
            </div>
            
        </div>
        </>
    )
}