import Head from 'next/head';
import Layout from '../../components/layout';
import Image from 'next/image';
import Date from '../../components/date';
import { getAllPostIds, getPostData } from '../../lib/posts';

import utilStyles from '../../styles/utils.module.css';

export async function getStaticProps({ params }) {
    // Add the "await" keyword like this:
    const postData = await getPostData(params.id);
  
    return {
      props: {
        postData,
      },
    };
  }
export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Post({ postData }) {
    return (
      <Layout>
        <Head>
          <title>{postData.title}</title>
        </Head>
         <Image src={postData.image} alt={postData.title} width={300} height={300}/>
        <article>
         
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    );
  }