<script setup>
    import Modal from '../components/Modal.vue';
    import { ref, reactive, provide, readonly, computed, inject, onMounted } from 'vue';
    import { useToast } from "vue-toastification";
    import * as firebase from '../firebase.js';
    const toast = useToast();
    const swal = inject('$swal');

    // 資料庫初始化
    const db_login_modal = reactive({
        show: false, email: '', password:'',
    })
    const input_email = ref(null);
    const sign_in = () => {
        firebase.db_sign_in(db_login_modal.email, db_login_modal.password).then(() => {
            toast.success('登入成功');
            db_login_modal.show = false;
            console.log(firebase.get_db_data('users'));

            /*避免重整*/
            let check_renew = false;
            window.onbeforeunload=function(e){
            if(check_renew){
                var e=window.event||e;
                e.returnValue=("確定離開當前頁面嗎？");
                }
            }
        })
        .catch((error) => {
            console.log(error.message);
            swal({
                title: '登入失敗',
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: '重新登入',
                confirmButtonColor: '#3085d6',
                cancelButtonText: '離開',
                cancelButtonColor: '#d33',
            }).then((result) => {
                if(!result.isConfirmed){
                location.href = '/index.html';
                }
            });
        });
    }
    setTimeout(()=>{ 
        input_email.value.focus();
        toast.info('請先登入系統');
    }, 100);

    let users = ref('');
    const add_users = async() => {
        let new_data = [];
        let data = users.value;
        data = data.split(',')
        for (let i = 0; i < data.length; i++) {
            const d = data[i].trim();
            if(d){ 
                new_data.push({
                    id:null, 
                    name:d, 
                    nick:null, 
                    gender:'男', 
                    level:0, 
                    phone:null, 
                    email:null, 
                    played:0, 
                    wait:0, 
                    status:0,
                });
            }
        }
        // console.log(new_data);
        let ids = await firebase.set_data('users', new_data);
        console.log(ids);
    }
    const get_users = async() => {
        let data = await firebase.get_db_data('users')
        console.log(data);
    }
</script>

<template>
    <!-- 登入授權資料庫 -->
    <modal :show="db_login_modal.show" :click_bg_close="false" @close="">
        <template #header>
        <h3 class="font-bold text-xl">登入授權資料庫</h3>
        </template>
        <template #body>
        信箱：<input type="email" class="form-input px-1 py-1 rounded w-full" ref="input_email" v-model="db_login_modal.email"/>
        密碼：<input type="password" class="form-input px-1 py-1 rounded w-full" v-model="db_login_modal.password"/>
        </template>
        <template #footer>
        <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
                :class="'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'"
                @click="sign_in">
            登入
        </button>
        </template>
    </modal>

    <h1 class="mt-20">批次新增人員</h1>
    <textarea class="w-full" rows="10" v-model="users"></textarea>
    <button class="w-full px-4 py-2 bg-green-400" @click="add_users">儲存</button>

    <button class="w-full px-4 py-2 bg-green-400 mt-4" @click="get_users">查看</button>
</template>