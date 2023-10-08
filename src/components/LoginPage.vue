<script lang="ts">
import { 
    NCard,
    NTabs,
    NTabPane,
    NForm,
    NFormItemRow,
    NButton,
    NInput
 } from 'naive-ui';

 import { rsiLogin, rsiMultiStepLogin } from '../../electron/uitils/signin'

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
                rsiMultiStepLogin(this.loginCodeInputValue).then((res) => {
                    console.log(res)
                    if (res) {
                        console.log('登录成功')
                    } else {
                        console.log('登录失败')
                    }
                    this.isLoginBtnLoading = false
                }).catch((err) => {
                    console.log(err.message)
                    this.isLoginBtnLoading = false
                    this.isMultiStepVisible = false
                })
                return
            }
            if (this.loginEmailInputValue && this.loginPasswordInputValue) {
                rsiLogin(this.loginEmailInputValue, this.loginPasswordInputValue).then((res) => {
                    console.log(res)
                    if (res) {
                        console.log('登录成功')
                    } else {
                        console.log('登录失败')
                    }
                    this.isLoginBtnLoading = false
                }).catch((err) => {
                    if (err.message === 'MultiStepRequiredException') {
                        this.isMultiStepVisible = true
                        this.isLoginBtnLoading = false
                        return
                    }
                    console.log(err.message)
                    this.isLoginBtnLoading = false
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