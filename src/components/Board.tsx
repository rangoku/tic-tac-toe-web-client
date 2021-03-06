import React, { useEffect, useRef, useState } from 'react'
import Loader from 'react-loader-spinner'
import { board, setBoardCell } from '../board/board'
import { handleClick } from '../functions/handleClick'
import { socket } from '../functions/sockets'
import { PLAYER_SYMBOL } from '../globals/globals'

import '../styles/board.css'
import '../styles/styles.css'

const Loading = (): JSX.Element => {
    return (
        <div className={"container visibility-hidden"}>
            <span className={"__default__font-style"}>SEARCHING FOR OPPONENT</span>
            <Loader type="ThreeDots" height={80} width={80} />
        </div>
    )
}

export default function Board(): JSX.Element {

    const [game, setGame] = useState(false)
    const [isMyMove, setIsMyMove] = useState(true)
    const [isGameOver, setIsGameOver] = useState(false)
    const [isWin, setIsWin] = useState(false)
    const [isDraw, setIsDraw] = useState(false)
    const [isOpponentDisconnected, setIsOpponentDisconnected] = useState(false)

    const boardRef = useRef<HTMLDivElement>(null)

    const btn0 = useRef<HTMLButtonElement>(null)
    const btn1 = useRef<HTMLButtonElement>(null)
    const btn2 = useRef<HTMLButtonElement>(null)
    const btn3 = useRef<HTMLButtonElement>(null)
    const btn4 = useRef<HTMLButtonElement>(null)
    const btn5 = useRef<HTMLButtonElement>(null)
    const btn6 = useRef<HTMLButtonElement>(null)
    const btn7 = useRef<HTMLButtonElement>(null)
    const btn8 = useRef<HTMLButtonElement>(null)

    let boardMarkup: Array<JSX.Element> = []

    for (let i: number = 0; i < 9 /*cells number*/; ++i)
        boardMarkup[i] = (
            <button
                key={i}
                ref={eval(`btn${i}`)}
                className={"block"}
                id={`block_${i}`}
                onClick={handleClick}>
            </button>
        )


    const disableBoard = (board: typeof boardRef): void => {
        board.current!.style.pointerEvents = 'none'
    }

    const enableBoard = (board: typeof boardRef): void => {
        board.current!.style.pointerEvents = 'auto'
    }

    const makePageReloadOnClick = (): void => {
        document.querySelector('body')?.addEventListener('click', () => {
            window.location.href = '/'
        })
    }

    useEffect(() => {

        socket.on('start-game', (first_turn: string) => {
            setGame(true)

            if (first_turn !== PLAYER_SYMBOL) {
                boardRef.current!.style.pointerEvents = 'none'
                setIsMyMove(false)
            }
        })

        socket.on('turn', (turn: { position: number, symbol: 'X' | 'O' }) => {

            eval(`btn${turn.position}`).current!.innerHTML = turn.symbol

            setBoardCell(turn.position, turn.symbol)

            if (turn.symbol !== PLAYER_SYMBOL) {
                enableBoard(boardRef)
                setIsMyMove(true)
            }
            else {
                disableBoard(boardRef)
                setIsMyMove(false)
            }

        })

        socket.on('draw', () => {
            setIsDraw(true)
            setIsGameOver(true)
            makePageReloadOnClick()
        })

        socket.on('game-over', (
            gameOver: { winner: string, combination: number[] }
        ) => {

            setIsGameOver(true)

            disableBoard(boardRef)
            makePageReloadOnClick()

            for (let i: number = 0; i < gameOver.combination.length; ++i)
                eval(`btn${gameOver.combination[i]}`).current!.style.color = 'yellow'

            setIsWin(gameOver.winner === PLAYER_SYMBOL)

        })

        socket.on('opponent-disconnected', () => {
            disableBoard(boardRef)
            makePageReloadOnClick()

            setIsOpponentDisconnected(true)
            setIsGameOver(true)
        })

    }, [])

    return (
        <>
            <div className="container">
                {
                    game ?
                        <>
                            <h1 className="__default__color-green" style={{ marginBottom: '2rem' }}>
                                {
                                    isOpponentDisconnected ? <span>Opponent left</span>
                                        : isGameOver ?
                                            isDraw ? <span>Draw</span>
                                                : isWin ?
                                                    <span>You win!</span> : <span>You lose!</span>
                                            :
                                            isMyMove ? <span>Your turn</span> : <span>Opponent's turn</span>
                                }
                            </h1>
                            <div id="board" ref={boardRef}>{boardMarkup}</div>
                        </>
                        : <Loading />
                }
            </div>
        </>
    )
}