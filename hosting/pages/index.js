import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link';
import Date from '../components/date';
import { initializeApp } from 'firebase/app';
import QrCode from 'qrcodejs';
import {
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, multiFactor,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  signOut,
  TotpSecret,
  reauthenticateWithPopup,
} from "firebase/auth";
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

  const [currentUser, setCurrentUser] = useState();
  const [totpCompleted, setTotpCompleted] = useState();
  const [totpUri, setTotpUri] = useState();
  const [totpSecret, setTotpSecret] = useState();

  const signInGoogle = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider)

      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      
      // Generate a TOTP secret.
      const multiFactorSession = await multiFactor(user).getSession();
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);

      const _totpUri = totpSecret.generateQrCodeUrl(
        user.email,
        "Weird Events"
      );

      const matrix = QrCode.generate(_totpUri);
      const uri = QrCode.render('svg-uri', matrix);

      setCurrentUser(user);
      setTotpUri(uri);
      setTotpSecret(totpSecret);

    }
    catch (error) {

      switch (error.code) {
        case "auth/multi-factor-auth-required":
          // Initiate your second factor sign-in flow. (See next step.)
          // ...
          const mfaResolver = getMultiFactorResolver(getAuth(), error);
          const enrolledFactors = mfaResolver.hints.map(info => info.displayName).join(',');

          setTimeout(async () => {

            // OTP typed by the user.
            const otpFromAuthenticator = prompt("2FA required from" + enrolledFactors);
            // default option this example assumes only TOTP enrolled
            const selectedIndex = 0;
            const multiFactorAssertion =
              TotpMultiFactorGenerator.assertionForSignIn(
                mfaResolver.hints[selectedIndex].uid,
                otpFromAuthenticator
              );

            try {
              const userCredential = await mfaResolver.resolveSignIn(
                multiFactorAssertion
              );

              // Successfully signed in!
            } catch (error) {

              setTotpCompleted(false);
              // Invalid or expired OTP.
              alert('wrong code!')
            }
          }, 1000);


          break;
        default:  // Handle other errors, such as wrong passwords.
          break;
      }



    }
  }

  const authenticatorComplete = async () => {
    // Finalize the enrollment.
    // Ask the user for a verification code from the authenticator app.
    const verificationCode = prompt("Please enter the 2FA code from Authenticator");
    if (verificationCode) {

      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        verificationCode
      );
      await multiFactor(currentUser).enroll(multiFactorAssertion, currentUser.displayName);

      setTotpCompleted(true);
    }
  }

  const logOut = async () => {
    const auth = getAuth();
    await signOut(auth);

    setCurrentUser(null);
    setTotpUri(null);
    setTotpSecret(null);
  }
  const unenrollUser = async () => {
    try {


      // Unenroll from TOTP MFA.
      const multiFactorUser = multiFactor(currentUser);
      // default option this example assumes only TOTP enrolled
      const selectedIndex = 0;

      await multiFactorUser.unenroll(multiFactorUser.enrolledFactors[selectedIndex])

    } catch (error) {
      console.error(error);

      // const provider = new GoogleAuthProvider();
      // await reauthenticateWithPopup(currentUser, provider);
      // unenroll();
      if (error.code === 'auth/user-token-expired') {
        // If the user was signed out, re-authenticate them.

        // For example, if they signed in with a password, prompt them to
        // provide it again, then call `reauthenticateWithCredential()` 
      }
    }
  }

  useEffect(() => {

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      console.log('user', user)
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;

        setCurrentUser(user);
        // ...
      } else {
        setCurrentUser(null);
        // User is signed out
        // ...
      }
    });
  }, [])
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
        <meta name="google-site-verification" content="SktOoGHe9L4GXP-GzPWToFXKLMHym1Who1OYKZm6eqs" />
      </Head>
      {!currentUser && <button onClick={signInGoogle}>Login with Google</button>}
      {!!currentUser?.displayName && <div>Welcome {currentUser.displayName}
        <button onClick={logOut}>Log out</button>
      </div>}

      {!!totpUri && !totpCompleted && <img src={totpUri} width={500} height={500} />}
      {!!totpSecret && !totpCompleted && <div>Secret: {totpSecret.secretKey}</div>}
      {!!totpUri && !totpCompleted && <button onClick={authenticatorComplete}>I have added to Authenticator</button>}
      {!!currentUser && !!totpCompleted && <button onClick={unenrollUser}>Remove 2FA</button>}

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
