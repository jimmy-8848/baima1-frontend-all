import {ElMessage} from "element-plus";
import axios from "axios";

const access_token = 'access_token'
const user_profile = 'user_profile'

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 15000
});

api.interceptors.request.use(config => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

function toastFailure(url, code, message) {
    console.warn(`错误路径:${url},错误码:${code},错误信息:${message}`)
    ElMessage.warning(message)
}

function toastError(error) {
    console.error(error)
    // 只在没有响应数据时才显示通用错误
    if (!error.response || !error.response.data) {
        ElMessage.error('网络连接失败，请检查网络或联系管理员')
    }
}

function storeToken(token, expire, remember, extraUser = {}) {
    const tokenObj = {token, expire}
    const tokenObjString = JSON.stringify(tokenObj)
    if (remember) localStorage.setItem(access_token, tokenObjString)
    else sessionStorage.setItem(access_token, tokenObjString)
    if (extraUser) {
        localStorage.setItem(user_profile, JSON.stringify(extraUser))
    }
}

function deleteToken() {
    localStorage.removeItem(access_token)
    sessionStorage.removeItem(access_token)
    localStorage.removeItem(user_profile)
}

function getTokenInfo() {
    const tokenObjString = localStorage.getItem(access_token) || sessionStorage.getItem(access_token)
    if (tokenObjString) {
        const tokenObj = JSON.parse(tokenObjString)
        if (new Date(tokenObj.expire) <= new Date()) {
            deleteToken()
            ElMessage.warning('令牌过期，请重新登录')
            return null
        }
        return tokenObj
    }
    return null
}

function getToken() {
    const info = getTokenInfo()
    return info?.token || null
}

function getUserProfile() {
    const profileStr = localStorage.getItem(user_profile)
    if (!profileStr) return null
    try {
        return JSON.parse(profileStr)
    } catch {
        return null
    }
}

//通用 post/get（promise 版）
function apiPost(url, data = {}, onFail = toastFailure) {
    return api.post(url, data).then(({data}) => {
        if (data.code === 200) return data.data
        onFail(url, data.code, data.message)
        throw new Error(data.message)
    }).catch(err => {
        toastError(err)
        throw err
    })
}

function apiGet(url, params = {}, onFail = toastFailure) {
    return api.get(url, {params}).then(({data}) => {
        if (data.code === 200) return data.data
        onFail(url, data.code, data.message)
        throw new Error(data.message)
    }).catch(err => {
        toastError(err)
        throw err
    })
}

function apiDelete(url, params = {}, onFail = toastFailure) {
    return api.delete(url, {params}).then(({data}) => {
        if (data.code === 200) return data.data
        onFail(url, data.code, data.message)
        throw new Error(data.message)
    }).catch(err => {
        toastError(err)
        throw err
    })
}

function apiPut(url, data = {}, onFail = toastFailure) {
    return api.put(url, data).then(({data}) => {
        if (data.code === 200) return data.data
        onFail(url, data.code, data.message)
        throw new Error(data.message)
    }).catch(err => {
        toastError(err)
        throw err
    })
}

// 保持原有回调风格
function internalPost(url, data, success, failure = toastFailure) {
    apiPost(url, data, failure).then(res => success && success(res)).catch(() => {})
}

function internalGet(url, paramsOrSuccess, successOrFailure, maybeFailure) {
    let params = {}
    let success = paramsOrSuccess
    let failure = successOrFailure
    if (typeof paramsOrSuccess === 'object') {
        params = paramsOrSuccess
        success = successOrFailure
        failure = maybeFailure
    }
    if (typeof failure !== 'function') failure = toastFailure
    apiGet(url, params, failure).then(res => success && success(res)).catch(() => {})
}

function internalDelete(url, success, failure = toastFailure) {
    apiDelete(url, {}, failure).then(res => success && success(res)).catch(() => {})
}

// login
function login(username, password, remember, success) {
    api.post('/auth/login', {username, password}, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(({data}) => {
        if (data.code === 200) {
            const user = data.data
            ElMessage.success(`登录成功，欢迎${user.username || username}进入系统`)
            const expire = user.expire || new Date(Date.now() + 7 * 24 * 3600 * 1000)
            storeToken(user.token, expire, remember, {
                username: user.username,
                userId: user.id || user.userId,
                role: user.role
            })
            if (typeof success === 'function') {
                success(user)
            }
        } else {
            toastFailure('/auth/login', data.code, data.message)
        }
    }).catch(toastError)
}

// logout
function logout(success) {
    apiGet('/auth/logout').finally(() => {
        ElMessage.success('退出登录成功')
        deleteToken()
        success && success()
    })
}

function isUnauthorizedToken() {
    return !getToken()
}

export {
    isUnauthorizedToken,
    login,
    logout,
    internalPost as post,
    internalGet as get,
    apiGet,
    apiPost,
    apiDelete,
    apiPut,
    getToken,
    getTokenInfo,
    getUserProfile
}