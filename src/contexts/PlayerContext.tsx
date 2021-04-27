import { createContext, useState, ReactNode, useContext } from 'react';


type Episode = {
	title: string
	members: string
	thumbnail: string
	duration: number
	url: string
}

type PlayerContextData = {
	episodeList: Episode[]
	currentEpisodeIndex: number
	isPlaying: boolean
	setIsPlaying: (state: boolean) => void
	play: (episode: Episode) => void
	playList: (list: Episode[], index: number) => void
	playNext: () => void
	playPrevious: () => void
	togglePlay: () => void
	toggleShuffle: () => void
	setPlayingState: (state: boolean) => void
	hasNext: boolean
	hasPrevious: boolean
	isLooping: boolean
	isShuffling: boolean
	toggleLoop: () => void
	clearPlayerState: () => void
}

type PlayerContextProviderProps = {
	children: ReactNode
}

export const PlayerContext = createContext({} as PlayerContextData);

export const PlayerContextProvider = ({ children }: PlayerContextProviderProps) => {
	const [episodeList, setEpisodeList] = useState([])
	const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isLooping, setIsLooping] = useState(false)
	const [isShuffling, setIsShuffling] = useState(false)

	const play = (episode: Episode) => {
		setEpisodeList([episode])
		setCurrentEpisodeIndex(0)
		setIsPlaying(true)
	}

	const togglePlay = () => {
		setIsPlaying(!isPlaying)
	}

	const toggleLoop = () => {
		setIsLooping(!isLooping)
	}

	const toggleShuffle = () => {
		setIsShuffling(!isShuffling)
	}

	const setPlayingState = (state: boolean) => {
		setIsPlaying(state)
	}

	const playList = (list: Episode[], index: number) => {
		setEpisodeList(list)
		setCurrentEpisodeIndex(index)
		setIsPlaying(true)
	}

	const hasPrevious = currentEpisodeIndex > 0
	const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length

	const playNext = () => {
		if (isShuffling) {
			const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length)
			setCurrentEpisodeIndex(nextRandomEpisodeIndex)
		} else if (hasNext) {
			setCurrentEpisodeIndex(currentEpisodeIndex + 1)
		}
	}

	const playPrevious = () => {
		if (hasPrevious) {
			setCurrentEpisodeIndex(currentEpisodeIndex - 1)
		}
	}

	const clearPlayerState = () => {
		setEpisodeList([])
		setCurrentEpisodeIndex(0)
	}

	return (
		<PlayerContext.Provider
			value={{
				episodeList,
				currentEpisodeIndex,
				setIsPlaying,
				setPlayingState,
				play,
				playList,
				playNext,
				playPrevious,
				hasPrevious,
				hasNext,
				isPlaying,
				isShuffling,
				isLooping,
				togglePlay,
				toggleShuffle,
				toggleLoop,
				clearPlayerState
			}}>
			{children}
		</PlayerContext.Provider>
	)
}

export const usePlayer = () => {
	return useContext(PlayerContext)
}