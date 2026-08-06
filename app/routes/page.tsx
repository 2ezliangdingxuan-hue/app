import { Header } from "~/header/header"
import {pieces, colours} from "~/page/pieces"
import { board } from "~/page/board"
export default function page(){
    return(
        <>
        <Header/>
        <div className="p-8 flex flex-col">
            <h1 className="text-3xl font-bold mb-8">Page</h1>
            <div className="flex gap-3">
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
                <div className="flex flex-col gap-3">
                    {pieces && Object.entries(pieces).map(([name,shape],pieceIndex)=>
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
                )}
                </div>
                
            </div>
        </div>
        </>
    )
}