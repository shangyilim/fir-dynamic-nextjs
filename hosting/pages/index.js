import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link';
import Date from '../components/date';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useEffect, useLayoutEffect, useState } from 'react';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnQV4OFMKEgcou13Z2Q9ISpJdo9CVK0hk",
  authDomain: "fir-nextjs-5f43b.firebaseapp.com",
  databaseURL: "https://fir-nextjs-5f43b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-nextjs-5f43b",
  storageBucket: "fir-nextjs-5f43b.appspot.com",
  messagingSenderId: "839710336851",
  appId: "1:839710336851:web:9498cef40332bf3d0ce3a6",
  measurementId: "G-9BB2BD66E9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {

  const [displayName, setDisplayName] = useState();
  const signInGoogle = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        setDisplayName(user.displayName);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        console.error(error);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
    }
  
    useEffect(()=> {
 
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        console.log('user',user)
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
  
          setDisplayName(user.displayName);
          // ...
        } else {
          setDisplayName(null);
          // User is signed out
          // ...
        }
      });
    },[])
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
        <meta name="google-site-verification" content="SktOoGHe9L4GXP-GzPWToFXKLMHym1Who1OYKZm6eqs" />
      </Head>
      {!displayName && <button onClick={signInGoogle}>Login with Google</button>}
      {displayName && <div>Welcome {displayName}
        <button onClick={signInGoogle}>Log out</button>
      </div>}
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
