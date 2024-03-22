<script lang="ts">
import { 
    NCard,
    NTabs,
    NTabPane,
    NForm,
    NFormItemRow,
    NButton,
    NInput,
    NModal,
useNotification
 } from 'naive-ui';

 import { rsiForceLogin, rsiMultiStepLogin } from '../../electron/uitils/signin'
 import { addUserToDatabase, getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'
 import { getUser } from '../../electron/network/user-parser/UserParser'
 import { User } from '../../electron/database/DatabaseEntities'
import { RsiApiService } from '../../electron/network/RsiAPIService';

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
        NInput,
        NModal
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
            loginCodeInputValue: '',
            captcha: null,
            showCaptcha: false,
            captchaImage: ''
        }
    },
    methods: {
        handleLoginBtnClicked() {
            this.isLoginBtnLoading = true
            if (this.showCaptcha) {
                this.showCaptcha = false
            }
            if (this.isMultiStepVisible) {
                rsiMultiStepLogin(this.loginCodeInputValue).then((res: any) => {
                    // console.log(res)
                    if (res) {
                        try {
                          getUser(12138, this.loginEmailInputValue, this.loginPasswordInputValue).then((user) => {
                            addNewUser(user)
                            const refugeSettings = getRefugeSettings()
                              this.notification.success({
                                title: '登录成功',
                                content: `账号：${refugeSettings.currentUser.handle}(${refugeSettings.currentUser.id}) 已登录`
                            })
                            this.captcha = null
                            this.isMultiStepVisible = false
                            this.loginEmailInputValue = ''
                            this.loginPasswordInputValue = ''
                            window.location.hash = '#/'
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
                rsiForceLogin(this.loginEmailInputValue, this.loginPasswordInputValue, this.captcha).then((res) => {
                    if (this.captcha != null) {
                        this.captcha = null
                    }
                    if (res) {
                        getUser(12138, this.loginEmailInputValue, this.loginPasswordInputValue).then((user) => {
                          try {
                            addNewUser(user)
                            this.notification.success({
                              title: '登录成功',
                              content: `账号：${user.handle} 已登录`
                          })
                            this.loginEmailInputValue = ''
                            this.loginPasswordInputValue = ''
                            window.location.hash = '#/'
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
                    } else if (err.message === 'ErrCaptchaRequiredLauncher') {
                        window.RsiApi.rsiLauncherCaptcha().then((res) => {
                            this.showCaptcha = true
                            this.captchaImage = res
                        })
                        return
                    } else if (err.message === 'ErrInvalidChallengeCode') {
                        this.notification.error({
                          title: '验证码错误',
                          content: errorMessage
                      })
                      this.captcha = null
                      this.isLoginBtnLoading = false
                      return
                    }
                    console.log(err)
                    this.captcha = null
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
    <n-modal v-model:show="showCaptcha" preset="dialog" title="Dialog">
    <template #header>
      <div>需要验证码</div>
    </template>
      <div>
        <img :src="captchaImage" />
        <n-input v-model:value="captcha" placeholder="请输入验证码" />
      </div>
    <template #action>
      <n-button type="primary" @click="handleLoginBtnClicked">确定</n-button>
      <n-button @click="showCaptcha = false">取消</n-button>
    </template>
  </n-modal>
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