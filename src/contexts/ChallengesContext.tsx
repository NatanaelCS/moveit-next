import { createContext, useState, ReactNode, useEffect } from 'react'
import Cookies from 'js-cookie'
import challenges from '../../challenges.json'
import LevelUpModal from '../components/LevelUpModal'

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
  closeLevelUpModal: () => void
}

type ChallengesProviderProps = {
  children: ReactNode
  level: number
  currentExperience: number
  challengesCompleted: number
}

export const ChallengesContext = createContext({} as ChallengesContextData)

export function ChallengesProvider({ 
  children, 
  ...rest
}: ChallengesProviderProps) {
  const [level, setLevel] = useState(rest.level ?? 1)
  const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0)
  const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0)

  const [activeChallenge, setActiveChallenge] = useState(null)
  const [isLevelUpModal, setIsLevelUpModal] = useState(false)

  const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

  useEffect(() => {
    Notification.requestPermission() // para pedir permissão
  }, [])

  useEffect(() => {
    Cookies.set('level', String(level))
    Cookies.set('currentExperience', String(currentExperience))
    Cookies.set('challengesCompleted', String(challengesCompleted))
  }, [level, currentExperience, challengesCompleted])

  function levelUp() {
    setLevel(level + 1)
    setIsLevelUpModal(true)
  }

  function closeLevelUpModal() {
    setIsLevelUpModal(false)
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
    completeChallenge,
    closeLevelUpModal
  }

  return (
    <ChallengesContext.Provider value={contextValue}>
      {children}

      {isLevelUpModal && <LevelUpModal />}
      
    </ChallengesContext.Provider>
  )
}
