import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '../../services/api';
import Link from 'next/link';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';

import { usePlayer } from '../../contexts/PlayerContext';

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

type EpisodeProps = {
    episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
    const router = useRouter();
    const { play } = usePlayer();

    return (
        <>
            <Head>
                <title>{episode.title} | Podcaster</title>
            </Head>
            <div className={styles.episode}>
                <div className={styles.thumbnailContainer}>
                    <Link href={"/"}>
                        <button>
                            <img src="/arrow-left.svg" alt="" />
                        </button>
                    </Link>
                    <img className={styles.thumbnailImage} src={episode.thumbnail} alt="" />
                    <button onClick={() => play(episode)}>
                        <img src="/play.svg" alt="Tocar episódio" />
                    </button>
                </div>

                <header>
                    <h1>{episode.title}</h1>
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>

                <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />
            </div>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params;
    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
    }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24, // 24 hours
    }
}