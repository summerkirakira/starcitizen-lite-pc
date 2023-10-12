<script lang="ts">
import { 
    NCard,
    NTabs,
    NTabPane,
    NForm,
    NFormItemRow,
    NButton,
    NInput,
useNotification
 } from 'naive-ui';

 import { rsiForceLogin, rsiMultiStepLogin } from '../../electron/uitils/signin'
 import { addUserToDatabase, getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'
 import { getUser } from '../../electron/network/user-parser/UserParser'
 import { User } from '../../electron/database/DatabaseEntities'

function addNewUser(user: User) {
    const refugeSettings = getRefugeSettings()
    refugeSettings.accountSettings = {
        email: user.email,
        password: user.password
    }
    refugeSettings.currentUser = user
    addUserToDatabase(user)
    setRefugeSettings(refugeSettings)
}

export default {
    components: {
        NCard,
        NTabs,
        NTabPane,
        NForm,
        NFormItemRow,
        NButton,
        NInput
    },
    setup() {
        const notification = useNotification()
        return {
            notification
        }
    },
    data() {
        return {
            isMultiStepVisible: false,
            isLoginBtnLoading: false,
            loginEmailInputValue: '',
            loginPasswordInputValue: '',
            loginCodeInputValue: ''
        }
    },
    methods: {
        handleLoginBtnClicked() {
            this.isLoginBtnLoading = true
            if (this.isMultiStepVisible) {
                rsiMultiStepLogin(this.loginCodeInputValue).then((res: any) => {
                    // console.log(res)
                    if (res) {
                        try {
                          getUser(res.data.account_multistep.id, this.loginEmailInputValue, this.loginPasswordInputValue).then((user) => {
                            addNewUser(user)
                            const refugeSettings = getRefugeSettings()
                              this.notification.success({
                                title: '登录成功',
                                content: `账号：${refugeSettings.currentUser.handle}(${refugeSettings.currentUser.id}) 已登录`
                            })
                            this.isMultiStepVisible = false
                            this.loginEmailInputValue = ''
                            this.loginPasswordInputValue = ''
                          })
                        } catch (err) {
                          console.log(err)
                              this.notification.error({
                              title: '登录失败',
                              content: err.message
                          })
                        }
                    } else {
                        this.notification.error({
                            title: '登录失败',
                            content: '请检查邮箱验证码是否正确'
                        })
                    }
                    this.isLoginBtnLoading = false
                }).catch((err) => {
                  console.log(err)
                    this.isLoginBtnLoading = false
                    this.isMultiStepVisible = false
                    this.notification.error({
                        title: '登录失败',
                        content: err.message
                    })
                })
                return
            }
            if (this.loginEmailInputValue && this.loginPasswordInputValue) {
                rsiForceLogin(this.loginEmailInputValue, this.loginPasswordInputValue).then((res) => {
                    console.log(res)
                    if (res) {
                        getUser(res.data.account_signin.id, this.loginEmailInputValue, this.loginPasswordInputValue).then((user) => {
                          try {
                            addNewUser(user)
                            this.notification.success({
                              title: '登录成功',
                              content: `账号：${res.data.account_signin.displayname}(${res.data.account_signin.id}) 已登录`
                          })
                            this.loginEmailInputValue = ''
                            this.loginPasswordInputValue = ''
                          } catch (err) {
                              this.notification.error({
                              title: '登录失败',
                              content: err.message
                          })
                          }
                          
                        })
                    } else {
                        console.log('登录失败')
                        this.notification.error({
                            title: '登录失败',
                            content: '请检查邮箱和密码是否正确'
                        })
                    }
                    this.isLoginBtnLoading = false
                }).catch((err) => {
                  let errorMessage = err.message
                    if (err.message === 'MultiStepRequiredException') {
                        this.isMultiStepVisible = true
                        this.isLoginBtnLoading = false
                        return
                    } else if (err.message === 'CFUValidationException') {
                        errorMessage = '校验码错误，请稍后重试'
                    } else if (err.message === 'MultiStepWrongCodeException') {
                        errorMessage = '验证码错误'
                    }
                    console.log(err)
                    this.isLoginBtnLoading = false
                    this.notification.error({
                        title: '登录失败',
                        content: errorMessage
                    })
                })
            } else {
                console.log('请输入邮箱和密码')
                console.log(this.loginEmailInputValue)
                this.isLoginBtnLoading = false
            }
        }
    }
}


</script>
<template>
    <div>
    <n-card>
      <n-tabs
        class="card-tabs"
        default-value="signin"
        size="large"
        animated
        pane-wrapper-style="margin: 0 -4px"
        pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
      >
        <n-tab-pane name="signin" tab="登录">
          <n-form>
            <n-form-item-row label="邮箱">
              <n-input class="login-input" v-model:value="loginEmailInputValue" placeholder="请输入RSI邮箱地址" style="text-align: left;"/>
            </n-form-item-row>
            <n-form-item-row label="密码">
              <n-input class="login-input" v-model:value="loginPasswordInputValue" type="password" show-password-on="mousedown" placeholder="请输入密码"/>
            </n-form-item-row>
            <n-form-item-row label="邮箱验证码" v-show="isMultiStepVisible">
              <n-input class="login-input" v-model:value="loginCodeInputValue" placeholder="请输入发送到邮箱的验证码"/>
            </n-form-item-row>
          </n-form>
          <n-button type="primary" block secondary strong @click="handleLoginBtnClicked" :loading="isLoginBtnLoading">
            登录
          </n-button>
        </n-tab-pane>
        <n-tab-pane name="signup" tab="注册">
          <n-form>
            <n-form-item-row label="用户名">
              <n-input class="login-input" />
            </n-form-item-row>
            <n-form-item-row label="密码">
              <n-input class="login-input" />
            </n-form-item-row>
            <n-form-item-row label="重复密码">
              <n-input class="login-input" />
            </n-form-item-row>
          </n-form>
          <n-button type="primary" block secondary strong :disabled="true">
            注册
          </n-button>
        </n-tab-pane>
      </n-tabs>
    </n-card>
</div>
  </template>
  
  <style scoped>
  .card-tabs .n-tabs-nav--bar-type {
    padding-left: 4px;
  }
  .login-input {
    text-align: left;
  }
  </style>