import Head from 'next/head';
import Layout from '../components/layout';
import Image from 'next/image';
import Date from '../components/date';

import utilStyles from '../styles/utils.module.css';

// This gets called on every request
export async function getServerSideProps() {
    // Fetch data from external API
    const res = await fetch(`https://fir-nextjs-5f43b-default-rtdb.asia-southeast1.firebasedatabase.app/events.json`);
    const data = await res.json();
   
    // Pass data to the page via props
    return { props: { data } };
  }


export default function MyEvents({ data }) {
    return (
      <Layout>
        <Head>
          <title>My Events</title>
        </Head>
        <article>
            <h1>My Events</h1>
         {data.map(d=><div>{d.name}</div>)}
        </article>
      </Layout>
    );
  }