import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
  type NativeModuleError,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { googleWebClientId } from './config';

let configured = false;

export function configureGoogleSignIn() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: googleWebClientId,
  });
  configured = true;
}

function isErrorWithCode(err: unknown): err is NativeModuleError {
  return typeof err === 'object' && err !== null && 'code' in err;
}

export async function signInWithGoogle(
  auth: Auth,
  firestore: Firestore | null,
  onSuccess: () => void,
  onError: (message: string) => void
) {
  try {
    configureGoogleSignIn();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      return;
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      onError('Não foi possível obter o token do Google. Tente novamente.');
      return;
    }
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    if (firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName ?? '',
          email: user.email ?? '',
          photoURL: user.photoURL ?? null,
        });
      }
    }

    onSuccess();
  } catch (err) {
    if (isErrorWithCode(err)) {
      switch (err.code) {
        case statusCodes.IN_PROGRESS:
          onError('Login já em andamento.');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          onError('Google Play Services não disponível ou desatualizado.');
          break;
        case statusCodes.SIGN_IN_CANCELLED:
          break;
        default:
          onError('Erro ao entrar com Google. Tente novamente.');
      }
    } else {
      onError('Erro ao entrar com Google. Tente novamente.');
    }
    throw err;
  }
}
