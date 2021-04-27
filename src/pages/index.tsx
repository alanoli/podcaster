import { GetStaticProps } from 'next';
import { api } from '../services/api';
import Head from 'next/head';
import Link from 'next/link';
// import Image from 'next/Image';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';

type Episode = {
	id: string
	title: string
	members: string
	publishedAt: Date
	thumbnail: string
	duration: number
	description: string
	url: string
	durationAsString: string
}

type HomeProps = {
	latestEpisodes: Episode[];
	allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
	const { playList } = usePlayer()

	const episodeList = [...latestEpisodes, ...allEpisodes]

	return (
		<>
			<Head>
				<title>Home | Podcaster</title>
			</Head>
			<div className={styles.homepage}>
				<section className={styles.latestEpisodes}>
					<h2>Últimos lançamentos</h2>
					<ul>
						{latestEpisodes.map((episode, index) => {
							return (
								<li key={episode.id}>
									<img width={192} height={192} src={episode.thumbnail} alt={episode.title} />
									<div className={styles.episodeDetails}>
										<Link href={`/episodes/${episode.id}`}>
											<a>{episode.title}</a>
										</Link>
										<p>{episode.members}</p>
										<span>{episode.publishedAt}</span>
										<span>{episode.durationAsString}</span>
									</div>

									<button type="button" onClick={() => playList(episodeList, index)}>
										<img src="/play-green.svg" alt="Tocar episódio" />
									</button>
								</li>
							)
						})}
					</ul>
				</section>
				<section className={styles.allEpisodes}>
					<h2>Todos episódios</h2>
					<table cellSpacing={0}>
						<thead>
							<tr>
								<th></th>
								<th>Podcast</th>
								<th>Integrantes</th>
								<th>Data</th>
								<th>Duração</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{allEpisodes.map((episode, index) => {
								return (
									<tr key={episode.id}>
										<td style={{ width: 72 }}>
											<img width={120} height={120} src={episode.thumbnail} alt={episode.title} />
										</td>
										<td>
											<Link href={`/episodes/${episode.id}`}>
												<a>{episode.title}</a>
											</Link>
										</td>
										<td>{episode.members}</td>
										<td style={{ width: 100 }}>{episode.publishedAt}</td>
										<td>{episode.durationAsString}</td>
										<td>
											<button onClick={() => playList(episodeList, index + latestEpisodes.length)}>
												<img src="/play-green.svg" alt="Tocar episódio" />
											</button>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</section>
			</div>
		</>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 12,
			_sort: 'published_at',
			_order: 'desc'
		}
	})

	const episodes = data.map(episode => {
		return {
			id: episode.id,
			title: episode.title,
			thumbnail: episode.thumbnail,
			members: episode.members,
			publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
			duration: Number(episode.file.duration),
			durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
			description: episode.description,
			url: episode.file.url,
		}
	})

	const latestEpisodes = episodes.slice(0, 2);
	const allEpisodes = episodes.slice(2, episodes.length);

	return {
		props: {
			latestEpisodes: latestEpisodes,
			allEpisodes: allEpisodes
		},
		revalidate: 60 * 60 * 8,
	}
}