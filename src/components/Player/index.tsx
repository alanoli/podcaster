import React, { useState, useRef, useEffect } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import styles from './styles.module.scss'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

const Player = () => {
	const audioRef = useRef<HTMLAudioElement>(null)
	const [progress, setProgress] = useState(0)

	const {
		episodeList,
		currentEpisodeIndex,
		isPlaying,
		isLooping,
		isShuffling,
		hasPrevious,
		hasNext,
		playNext,
		playPrevious,
		togglePlay,
		toggleLoop,
		toggleShuffle,
		setPlayingState,
		clearPlayerState

	} = usePlayer()

	const setupProgressListener = () => {
		audioRef.current.currentTime = 0
		audioRef.current.addEventListener('timeupdate', () => {
			setProgress(Math.floor(audioRef.current.currentTime))
		})
	}

	const handleSeek = (amount: number) => {
		audioRef.current.currentTime = amount
		setProgress(amount)
	}

	const handleEpisodeEnded = () => {
		if(hasNext) {
			playNext()
		} else {
			clearPlayerState()
		}
	}

	const episode = episodeList[currentEpisodeIndex]

	useEffect(() => {
		if (!audioRef.current) return
		isPlaying ? audioRef.current.play() : audioRef.current.pause()
	}, [isPlaying])

	return (
		<div className={styles.playerContainer}>
			<header>
				<img src="/playing.svg" alt="Tocando agora" />
				<strong>Tocando agora</strong>
			</header>

			{episode ?
				<div className={styles.currentEpisode}>
					<img src={episode.thumbnail} alt="" />
					<strong>{episode.title}</strong>
					<span>{episode.members}</span>
				</div>
				:
				<div className={styles.emptyPlayer}>
					<strong>Selecione um podcast para ouvir</strong>
				</div>
			}

			<footer className={!episode ? styles.empty : ""}>
				<div className={styles.progress}>
					<span>{convertDurationToTimeString(progress)}</span>
					<div className={styles.slider}>
						{episode ?
							<Slider
								max={episode.duration}
								value={progress}
								onChange={handleSeek}
								trackStyle={{ backgroundColor: '#84d361' }}
								railStyle={{ backgroundColor: '#9f75ff' }}
								handleStyle={{ backgroundColor: '#84d361', borderWidth: '4' }}
							/>
							:
							<div className={styles.emptySlider} />}
					</div>
					<span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
				</div>

				{episode && (
					<audio
						ref={audioRef}
						src={episode.url}
						autoPlay
						onEnded={handleEpisodeEnded}
						loop={isLooping}
						onPlay={() => setPlayingState(true)}
						onPause={() => setPlayingState(false)}
						onLoadedMetadata={setupProgressListener}
					/>
				)}

				<div className={styles.buttons}>
					<button
						type="button"
						onClick={toggleShuffle}
						disabled={!episode || episodeList.length === 1}
						className={isShuffling ? styles.isActive : ''}
					>
						<img src="/shuffle.svg" alt="Embaralhar" />
					</button>
					<button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
						<img src="/play-previous.svg" alt="Tocar anterior" />
					</button>
					<button type="button" className={styles.playButton} disabled={!episode} onClick={() => togglePlay()}>
						{isPlaying ? <img src="/pause.svg" alt="Pausar" /> : <img src="/play.svg" alt="Tocar" />}
					</button>
					<button type="button" onClick={playNext} disabled={!episode || !hasNext}>
						<img src="/play-next.svg" alt="Tocar próximo" />
					</button>
					<button
						type="button"
						disabled={!episode}
						onClick={toggleLoop}
						className={isLooping ? styles.isActive : ''}
					>
						<img src="/repeat.svg" alt="Repetir" />
					</button>
				</div>
			</footer>
		</div>
	)
}

export default Player
