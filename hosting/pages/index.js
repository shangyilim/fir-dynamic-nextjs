import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link';
import Date from '../components/date';

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({allPostsData}) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Upcoming</h2>
        <div className={utilStyles.catalog}>
          {allPostsData.map(({ id, date, title, image }) => (
          <div className={utilStyles.catalogItem} key={id}>
            <Image
              src={image} // Route of the image file
                alt={title} 
                width={200}
                height={150}
            />
            <div className={utilStyles.catalogItemDescription}>
            <Link href={`/posts/${id}`}>{title}</Link>
            <br />
            <small className={utilStyles.lightText}>
              <Date dateString={date} />
            </small>
            </div>
          </div>
           
          ))}
        </div>
      </section>
    </Layout>
  )
}
