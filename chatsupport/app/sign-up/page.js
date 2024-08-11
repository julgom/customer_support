'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import { createUserWithEmailAndPassword,  updateProfile } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';




// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

const SignUp = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
    const router = useRouter();
  
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

       if (!firstName || !lastName ) {
            setError('Please fill out all fields.');
            return;
          }
      
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Sign-up successful:', cred);

         // Update user's profile with first and last name
         await updateProfile(cred.user, {
            displayName: `${firstName}`
        });

        sessionStorage.setItem('user', 'true');
        //sessionStorage.setItem('user', JSON.stringify({ firstName, lastName, email }));
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        router.push('/');
      } catch (error) {
        console.error('Sign-up error:', error);
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
                errorMessage = 'Invalid credentials. Please check your email and password.';
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
              Sign up
            </Typography>
            {error && (
              <Typography color="error" variant="body2" align="center" sx={{ color: '#1DB954' }}>
                {error}
              </Typography>
            )}
            <Box component="form" noValidate sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                    autoComplete="new-password"
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
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link href="/sign-in" variant="body2" sx={{ color: '#1DB954' }}>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default SignUp;

/*
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env'  --exclude '.gitignore'  --exclude '.env.local' \
-e "ssh -i ~/Downloads/california-julia-mbp-2.pem" \
. ubuntu@ec2-35-90-10-172.us-west-1.compute.amazonaws.com:~/app

*/

