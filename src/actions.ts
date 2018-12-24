import axios from 'axios'
import {
  Dispatch,
  Store,
} from 'redux'
import {
  AuthResponse,
  DeviceStorage,
  VerificationParams,
  UserAttributes,
  UserRegistrationDetails,
  UserSignInCredentials,
  UserSignOutCredentials,
  ActionsExport,
  REGISTRATION_REQUEST_SENT,
  REGISTRATION_REQUEST_SUCCEEDED,
  REGISTRATION_REQUEST_FAILED,
  VERIFY_TOKEN_REQUEST_SENT,
  VERIFY_TOKEN_REQUEST_SUCCEEDED,
  VERIFY_TOKEN_REQUEST_FAILED,
  SIGNIN_REQUEST_SENT,
  SIGNIN_REQUEST_SUCCEEDED,
  SIGNIN_REQUEST_FAILED,
  SIGNOUT_REQUEST_SENT,
  SIGNOUT_REQUEST_SUCCEEDED,
  SIGNOUT_REQUEST_FAILED,
  SET_HAS_VERIFICATION_BEEN_ATTEMPTED,
  SET_ATTRIBUTES,
  RegistrationRequestSentAction,
  RegistrationRequestSucceededAction,
  RegistrationRequestFailedAction,
  VerifyTokenRequestSentAction,
  VerifyTokenRequestSucceededAction,
  VerifyTokenRequestFailedAction,
  SignInRequestSentAction,
  SignInRequestSucceededAction,
  SignInRequestFailedAction,
  SignOutRequestSentAction,
  SignOutRequestSucceededAction,
  SignOutRequestFailedAction,
  SetHasVerificationBeenAttemptedAction,
  AuthHeaders,
} from './types'
import AsyncLocalStorage from './AsyncLocalStorage'
import {
  deleteAuthHeaders,
  deleteAuthHeadersFromDeviceStorage,
  getUserAttributesFromResponse,
  persistAuthHeadersInDeviceStorage,
  setAuthHeaders,
} from './services/auth'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pure Redux actions:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const registrationRequestSent = (): RegistrationRequestSentAction => ({
  type: REGISTRATION_REQUEST_SENT,
})

export const registrationRequestSucceeded = (userAttributes: UserAttributes): RegistrationRequestSucceededAction => ({
  type: REGISTRATION_REQUEST_SUCCEEDED,
  payload: {
    userAttributes,
  },
})

export const registrationRequestFailed = (): RegistrationRequestFailedAction => ({
  type: REGISTRATION_REQUEST_FAILED,
})

export const verifyTokenRequestSent = (): VerifyTokenRequestSentAction => ({
  type: VERIFY_TOKEN_REQUEST_SENT,
})

export const verifyTokenRequestSucceeded = (userAttributes: UserAttributes): VerifyTokenRequestSucceededAction => ({
  type: VERIFY_TOKEN_REQUEST_SUCCEEDED,
  payload: {
    userAttributes,
  },
})

export const verifyTokenRequestFailed = (): VerifyTokenRequestFailedAction => ({
  type: VERIFY_TOKEN_REQUEST_FAILED,
})

export const signInRequestSent = (): SignInRequestSentAction => ({
  type: SIGNIN_REQUEST_SENT,
})

export const signInRequestSucceeded = (userAttributes: UserAttributes): SignInRequestSucceededAction => ({
  type: SIGNIN_REQUEST_SUCCEEDED,
  payload: {
    userAttributes,
  },
})

export const signInRequestFailed = (): SignInRequestFailedAction => ({
  type: SIGNIN_REQUEST_FAILED,
})

export const signOutRequestSent = (): SignOutRequestSentAction => ({
  type: SIGNOUT_REQUEST_SENT,
})

export const signOutRequestSucceeded = (): SignOutRequestSucceededAction => ({
  type: SIGNOUT_REQUEST_SUCCEEDED,
})

export const signOutRequestFailed = (): SignOutRequestFailedAction => ({
  type: SIGNOUT_REQUEST_FAILED,
})

export const setHasVerificationBeenAttempted = (
  hasVerificationBeenAttempted: boolean
): SetHasVerificationBeenAttemptedAction => ({
  type: SET_HAS_VERIFICATION_BEEN_ATTEMPTED,
  payload: {
    hasVerificationBeenAttempted,
  },
})

export const setAttributesSent = (attributes: { [key: string]: any }) => ({
  type: SET_ATTRIBUTES,
  payload: {
    attributes,
  },
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Async Redux Thunk actions:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const generateAuthActions = (config: { [key: string]: any }): ActionsExport => {
  const {
    authUrl,
    storage,
    userAttributes,
    userRegistrationAttributes,
  } = config

  const Storage: DeviceStorage = Boolean(storage) ? storage : AsyncLocalStorage

  const registerUser = (
    userRegistrationDetails: UserRegistrationDetails,
  ) => async function (dispatch: Dispatch<{}>): Promise<void> {
    dispatch(registrationRequestSent())
    const {
      password,
      passwordConfirmation,
    } = userRegistrationDetails
    const data = {
      password,
      password_confirmation: passwordConfirmation,
    }
    Object.keys(userRegistrationAttributes).forEach((key: string) => {
      const backendKey = userRegistrationAttributes[key]
      data[backendKey] = userRegistrationDetails[key]
    })
    try {
      const response: AuthResponse = await axios({
        method: 'POST',
        url: authUrl,
        data,
      })
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(userAttributes, response)
      dispatch(registrationRequestSucceeded(userAttributesToSave))
    } catch (error) {
      dispatch(registrationRequestFailed())
      throw error
    }
  }

  const updateUser = (
    userUpdateDetails: UserRegistrationDetails,
  ) => async function (dispatch: Dispatch<{}>): Promise<void> {
    dispatch(registrationRequestSent())
    const {
      password,
      passwordConfirmation,
    } = userUpdateDetails
    const data = {
      password,
      password_confirmation: passwordConfirmation,
    }
    Object.keys(userRegistrationAttributes).forEach((key: string) => {
      const backendKey = userRegistrationAttributes[key]
      data[backendKey] = userUpdateDetails[key]
    })
    try {
      const response: AuthResponse = await axios({
        method: 'PUT',
        url: authUrl,
        data,
      })
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(userAttributes, response)
      dispatch(registrationRequestSucceeded(userAttributesToSave))
    } catch (error) {
      dispatch(registrationRequestFailed())
      throw error
    }
  }
  
  const registerUserForm = ( data: any ) => async function (dispatch: Dispatch<{}>): Promise<void> {
    dispatch(registrationRequestSent())
    try {
      const response: AuthResponse = await axios({
        method: 'POST',
        url: authUrl,
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(userAttributes, response)
      dispatch(registrationRequestSucceeded(userAttributesToSave))
    } catch (error) {
      dispatch(registrationRequestFailed())
      throw error
    }
  }

  const updateUserForm = (data: any) => async function (dispatch: Dispatch<{}>): Promise<void> {
    dispatch(registrationRequestSent())
    try {
      const response: AuthResponse = await axios({
        method: 'PUT',
        url: authUrl,
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(userAttributes, response)
      dispatch(registrationRequestSucceeded(userAttributesToSave))
    } catch (error) {
      dispatch(registrationRequestFailed())
      throw error
    }
  }

  const verifyToken = (
    verificationParams: VerificationParams,
  ) => async function (dispatch: Dispatch<{}>): Promise<void> {
    dispatch(verifyTokenRequestSent())
    try {
      const response = await axios({
        method: 'GET',
        url: `${authUrl}/validate_token`,
        params: verificationParams,
      })
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(userAttributes, response)
      dispatch(verifyTokenRequestSucceeded(userAttributesToSave))
    } catch (error) {
      dispatch(verifyTokenRequestFailed())
    }
  }

  const signInUser = (
    userSignInCredentials: UserSignInCredentials,
  ) => async function (dispatch: Dispatch<{}>): Promise<void> {
    dispatch(signInRequestSent())
    try {
      const response = await axios({
        method: 'POST',
        url: `${authUrl}/sign_in`,
        data: userSignInCredentials,
      })
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(userAttributes, response)
      dispatch(signInRequestSucceeded(userAttributesToSave))
    } catch (error) {
      dispatch(signInRequestFailed())
      throw error
    }
  }

  const signOutUser = () => async function (dispatch: Dispatch<{}>): Promise<void> {
    const userSignOutCredentials: UserSignOutCredentials = {
      'access-token': await Storage.getItem('access-token') as string,
      client: await Storage.getItem('client') as string,
      uid: await Storage.getItem('uid') as string,
    }
    dispatch(signOutRequestSent())
    try {
      await axios({
        method: 'DELETE',
        url: `${authUrl}/sign_out`,
        data: userSignOutCredentials,
      })
      deleteAuthHeaders()
      deleteAuthHeadersFromDeviceStorage(Storage)
      dispatch(signOutRequestSucceeded())
    } catch (error) {
      dispatch(signOutRequestFailed())
      throw error
    }
  }

  const verifyCredentials = async (store: Store<{}>): Promise<void> => {
    if (await Storage.getItem('access-token')) {
      const verificationParams: VerificationParams = {
        'access-token': await Storage.getItem('access-token') as string,
        client: await Storage.getItem('client') as string,
        uid: await Storage.getItem('uid') as string,
      }
      await store.dispatch<any>(verifyToken(verificationParams))
    } else {
      store.dispatch(setHasVerificationBeenAttempted(true))
    }
  }

  const axiauth = async ({headers = {}, ...options}): Promise<any> => {
    const tokenHeaders: AuthHeaders = {
      'access-token': await Storage.getItem('access-token') as string,
      'token-type': await Storage.getItem('token-type') as string,
      client: await Storage.getItem('client') as string,
      expiry: await Storage.getItem('expiry') as string,
      uid: await Storage.getItem('uid') as string,
    }
    try {
      const response = await axios({
        headers: {
          ...tokenHeaders,
          ...headers,
        },
        ...options,
      })
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      return response
    } catch (error) {
      console.warn(error, error.response);
      if (!!error.response && error.response.status !== 401) {
        setAuthHeaders(error.response.headers)
        persistAuthHeadersInDeviceStorage(Storage, error.response.headers)
      }
      throw error
    }
  }

  const setAttributes = (attributes: { [key: string]: any }) => (dispatch: Dispatch<{}>) => {
    dispatch(setAttributesSent(attributes))
  }

  return {
    registerUser,
    updateUser,
    registerUserForm,
    updateUserForm,
    verifyToken,
    signInUser,
    signOutUser,
    verifyCredentials,
    axiauth,
    setAttributes,
  }
}

export default generateAuthActions
