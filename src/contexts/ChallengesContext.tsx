import { createContext, useState, ReactNode, useEffect } from 'react'
import challenges from '../../challenges.json'

type Challenge = {
  type: 'body' | 'eye'
  description: string
  amount: number
}

type ChallengesContextData = {
  level: Number
  currentExperience: number
  challengesCompleted: Number
  activeChallenge: Challenge
  experienceToNextLevel: number
  levelUp: () => void
  startNewChallenge: () => void
  resetChallenge: () => void
  completeChallenge: () => void
}

type ChallengesProviderProps = {
  children: ReactNode
}

export const ChallengesContext = createContext({} as ChallengesContextData)

export function ChallengesProvider({ children }: ChallengesProviderProps) {
  const [level, setLevel] = useState(1)
  const [currentExperience, setCurrentExperience] = useState(0)
  const [challengesCompleted, setChallengesCompleted] = useState(0)

  const [activeChallenge, setActiveChallenge] = useState(null)

  const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

  useEffect(() => {
    Notification.requestPermission() // para pedir permissão
  }, [])

  function levelUp() {
    setLevel(level + 1)
  }

  function startNewChallenge() {
    const randomChallengeIndex = Math.floor(Math.random()* challenges.length)
    const challenge = challenges[randomChallengeIndex]

    setActiveChallenge(challenge)
    
    new Audio('/notification.mp3').play() // para utilizar audios

    if (Notification.permission === 'granted') {
      new Notification('Novo desafio 🎉', {
        body: `Valendo ${challenge.amount}xp!`
      })
    } // se tiver dado permissão vai dar uma notificação
  }

  function resetChallenge() {
    setActiveChallenge(null)
  }

  function completeChallenge() {
    if (!activeChallenge) {
      return
    } // esta função não pode ser chamada se o active tiver ativo

    const { amount } = activeChallenge

    let finalExperience = currentExperience +  amount

    if (finalExperience >= experienceToNextLevel) {
      finalExperience = finalExperience - experienceToNextLevel
      levelUp()
    }

    setCurrentExperience(finalExperience)
    setActiveChallenge(null)
    setChallengesCompleted(challengesCompleted + 1)
  }

  const contextValue = {
    level,
    currentExperience,
    challengesCompleted,
    levelUp,
    startNewChallenge,
    activeChallenge,
    resetChallenge,
    experienceToNextLevel,
    completeChallenge
  }

  return (
    <ChallengesContext.Provider value={contextValue}>
      {children}
    </ChallengesContext.Provider>
  )
}
