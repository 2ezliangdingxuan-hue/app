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
    
    const handleShuffle = () =>{
        let shuffled = [...initialPieces];

        for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
        return shuffled;
    }

    useEffect(()=>{
        const shuffled = handleShuffle();
        setQueue(shuffled)
        handleAddQueue();
    },[]);

    

    const handleAddQueue = () => {
        if(queue.length === 7){
            const newItems = handleShuffle();
            setQueue(prevQueue => [ ...prevQueue,...newItems]);
        }
    }

    const handlePopQueue = () =>{
        setQueue(currentQueue => {
            return currentQueue.slice(1);
        })
        handleAddQueue();
    }

    const orderedPieces = pieces && Object.entries(pieces).map(([name,shape],pieceIndex)=>
        <div key={pieceIndex} className="space-x-3">
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
                {/* <div className="gap-3 flex flex-row mb-3">
                    {shuffledPieces}
                </div> */}
                <div>
                    {board.Default.map((row, rowIndex) =>(
                    <div key={rowIndex} className="flex">
                        {row.map((cell, cellIndex)=>
                            <div key={cellIndex} className="border h-4 w-4">
                                {/* {cell} */}
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
                    New match
                </button>
            </div>
        </div>
        </>
    )
}