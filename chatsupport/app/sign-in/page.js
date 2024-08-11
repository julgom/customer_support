'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect} from 'react';
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="http://localhost:3000">
        chat-support
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  //const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter()

  

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if ( !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign-in successful:', cred);
    
      sessionStorage.setItem('user', 'true');
      setEmail('');
      setPassword('');
      router.push('/');
    } catch (error) {
      // Log error details for debugging purposes
      console.error('Sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      let errorMessage = 'Sign-up failed. Please check your credentials or try again later.';

      switch (error.code) {
          case 'auth/invalid-email':
              errorMessage = 'The email address is not valid. Please check your email address.';
              break;
          case 'auth/user-not-found':
              errorMessage = 'No user found with this email address. Please check your email or sign up.';
              break;
          case 'auth/wrong-password':
              errorMessage = 'Incorrect password. Please try again or reset your password.';
              break;
          case 'auth/invalid-credential':
              errorMessage = 'Incorrect email or password. Please check your credentials or sign up if you do not have an account.';
              break;
          case 'auth/email-already-in-use':
              errorMessage = 'The email address is already in use. Please use a different email or sign in.';
              break;
          case 'auth/weak-password':
              errorMessage = 'The password is too weak. Please choose a stronger password.';
              break;
          case 'auth/missing-password':
              errorMessage = 'Please enter your password.';
              break;
          case 'auth/too-many-requests':
              errorMessage = 'Too many requests. Please try again later.';
              break;
          case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your connection.';
              break;
          default:
              errorMessage = 'An unknown error occurred. Please try again.';
      }

      setError(errorMessage);

    }

  };



return (
  <ThemeProvider theme={defaultTheme}>
    <CssBaseline />
    <Box
      sx={{
        backgroundColor: '#000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1DB954',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#1DB954' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ color: '#1DB954' }}>
            Sign In
          </Typography>
          {error && (
            <Typography color="error" variant="body2" align="center" sx={{ color: '#1DB954' }}>
              {error}
            </Typography>
          )}
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: '#fff',
                      backgroundColor: '#535353',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1DB954',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1DB954',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1DB954',
                    },
                    '& .MuiInputBase-input': {
                      color: '#fff',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1DB954',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: '#fff',
                      backgroundColor: '#535353',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1DB954',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1DB954',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1DB954',
                    },
                    '& .MuiInputBase-input': {
                      color: '#fff',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1DB954',
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#1DB954',
                color: '#000',
                '&:hover': {
                  backgroundColor: '#1aa34a',
                },
              }}
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link href="/sign-up" variant="body2" sx={{ color: '#1DB954' }}>
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </Box>
  </ThemeProvider>
);
}

export default SignIn;