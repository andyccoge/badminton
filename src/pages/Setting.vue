<script setup>
    import BodyBlock from '../components/BodyBlock.vue';
    import NavSetting from '../components/NavSetting.vue';
    import Modal from '../components/Modal.vue';
    import { ref, reactive, provide, readonly, computed, inject, onMounted } from 'vue';
    import { useToast } from "vue-toastification";
    import * as firebase from '../firebase.js';
    const toast = useToast();
    const swal = inject('$swal');
    let body_block_show = ref(false);

    // 資料庫初始化
    const db_login_modal = reactive({
        show: false, email: '', password:'',
    })
    const input_email = ref(null);
    const sign_in = async() => {
        body_block_show.value = true;
        try {
            await firebase.db_sign_in(db_login_modal.email, db_login_modal.password);
            toast.success('登入成功');
            db_login_modal.show = false;
        } catch (error) {
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
        }
        body_block_show.value = false;
    }
    const db_sign_out = () => {
        firebase.db_sign_out();
    }
    firebase.db_auth.onAuthStateChanged(async(user) => {
        if (user) {
            get_users();
        } else {
            db_login_modal.show = true
            setTimeout(()=>{ 
                input_email.value.focus();
                toast.info('請先登入系統');
            }, 100);
        }
    });
    provide('db_sign_out', db_sign_out);

    let users = ref([]);
    let users_input_data = ref('');
    const add_users = async() => {
        let new_data = [];
        let data = users_input_data.value;
        data = data.split(',');
        data = data.filter((item)=>{ return item.trim() });
        if(data.length==0){ toast.warning('請輸入員名稱');return; }
    
        body_block_show.value = true;
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
                    // played:0, 
                    // wait:0, 
                    // status:0,
                });
            }
        }
        // console.log(new_data);
        let ids = await firebase.set_data('users', new_data);
        await get_users();
        toast.success('新增成功');
        users_input_data.value = '';
        body_block_show.value = false;
    }
    const get_users = async() => {
        users.value = await firebase.get_db_data('users');
    }
</script>

<template>
    <BodyBlock :show="body_block_show"></BodyBlock>
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

    <NavSetting></NavSetting>

    <div class="p-2">
        <h1 class="text-xl font-bold">人員列表</h1>
        <h3 class="">批次新增人員(請輸入人名並以英文逗點分隔，人名間的空白及換行不會影響程式運作)</h3>
        <textarea class="w-full" rows="2" v-model="users_input_data" placeholder="陳XX, 王OO"></textarea>
        <p class="text-red-600">※此處新增不會檢查資料庫是否重複，因為姓名可重複</p>
        <button @click="add_users"
                class="w-full font-bold py-1 px-4 border-b-4 rounded
                    bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500">
            新增
        </button>

        <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5">
            <thead class="text-white">
                <tr v-for="(user, index) in users"
                    class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
                    <th class="border-grey-light border p-2 sm:border-0">序號</th>
                    <th class="border-grey-light border p-2 sm:border-0">姓名</th>
                    <th class="border-grey-light border p-2 sm:border-0">暱稱</th>
                    <th class="border-grey-light border p-2 sm:border-0">性別</th>
                    <th class="border-grey-light border p-2 sm:border-0">等級</th>
                    <th class="border-grey-light border p-2 sm:border-0">信箱</th>
                    <th class="border-grey-light border p-2 sm:border-0">電話</th>
                </tr>
            </thead>
            <tbody class="flex-1 sm:flex-none">
                <tr v-for="(user, index) in users"
                    class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
                    <td class="border-grey-light border p-2"><span v-text="index+1"></span></td>
                    <td class="border-grey-light border p-2"><span v-text="user.name"></span></td>
                    <td class="border-grey-light border p-2"><span v-text="user.nick"></span></td>
                    <td class="border-grey-light border p-2"><span v-text="user.gender"></span></td>
                    <td class="border-grey-light border p-2"><span v-text="user.level"></span></td>
                    <td class="border-grey-light border p-2"><span v-text="user.email"></span></td>
                    <td class="border-grey-light border p-2"><span v-text="user.phone"></span></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
    textarea{
        min-height: 2.5rem;
    }

    td{
        min-height: 42px;
    }
    @media (min-width: 480px) {
        table {
            display: inline-table !important;
        }

        thead tr:not(:first-child) {
            display: none;
        }

        td{
            min-height: unset;
        }
    }
</style>