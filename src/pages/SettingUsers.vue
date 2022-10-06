<script setup>
  import BodyBlock from '../components/BodyBlock.vue';
  import NavSetting from '../components/NavSetting.vue';
  import Modal from '../components/Modal.vue';
  import ModalUserEditor from '../components/ModalUserEditor.vue';
  import { ref, reactive, provide, readonly, computed, inject, onMounted } from 'vue';
  import { useToast } from "vue-toastification";
  import * as firebase from '../firebase.js';
  import { async } from '@firebase/util';
  const toast = useToast();
  const swal = inject('$swal');
  let body_block_show = ref(false);

  // 資料庫初始化-------------------------------------------------------------------------
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

  // 人員列表-------------------------------------------------------------------------
  let users = reactive([]);
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
    users.splice(0, users.length);
    let user_data = await firebase.get_db_data('users');
    user_data.forEach(data => {
      users.push(data);
    });
  }
  const user_delete = (user_index) => {
    if (user_index < 0 && user_index > users.length) { return; }
    swal({
      title: '確定刪除此人？',
      text: "刪除後此人過去的比賽紀錄可能顯示會有問題",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      confirmButtonColor: '#3085d6',
      cancelButtonText: '取消',
      cancelButtonColor: '#d33',
    }).then(async(result) => {
      if (result.isConfirmed) {
        body_block_show.value = true;
        await firebase.delete_data('users', users[user_index].id)
        users.splice(user_index, 1);
        body_block_show.value = false;
      }
    });
  }

  // 新增/編輯人員-------------------------------------------------------------------------
  let userModal = reactive({ 
    show:false, index:-1, 
    user:{id:0, name:'', nick:'', gender:"", level:0, phone:'', email:'', played:0, wait:0, status:0}
  });
  const userModal_open = (user_index=-1) => {
    // menu_open_bottom.value = true;
    userModal.show = true;
    userModal.index = user_index;
    if(user_index!=-1){ userModal.user = Object.assign({}, users[user_index]); }
  }
  provide('userModal', userModal);
  const change_user_data = (user_index, user_data) => {
    console.log(user_data);
    console.log(userModal.index);
    if(userModal.index==-1){
      users.push(user_data)
    }else{
      let user_keys = Object.keys(user_data);
      user_keys.forEach(key => { users[user_index][key] = user_data[key] });
    }
  }
  provide('change_user_data', change_user_data);
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

  <ModalUserEditor></ModalUserEditor>

  <NavSetting></NavSetting>

  <div class="p-2">
    <h1 class="text-xl font-bold">人員列表</h1>
    <h3 class="">批次新增人員(請輸入人名並以英文逗點分隔，人名間的空白及換行不會影響程式運作)</h3>
    <textarea class="w-full" rows="2" v-model="users_input_data" placeholder="陳XX, 王OO"></textarea>
    <p class="text-red-600">※此處新增不會檢查資料庫是否重複，因為姓名可重複</p>
    <button @click="add_users"
            class="w-full font-bold py-1 px-4 border-b-4 rounded
                bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500">
        批次新增
    </button>
    <hr class="my-3">
    <div>
      <button class="flex font-bold py-1 px-4 ml-2 border-b-4 rounded text-white
                     bg-yellow-500 hover:bg-yellow-400 border-yellow-700 hover:border-yellow-500" 
              @click="userModal_open(-1)">
        <span class="mr-2">單一新增</span>
        <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
      </button>
    </div>
    <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg mb-5">
        <thead class="text-white">
          <tr v-for="(user, index) in users"
              class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
            <th class="border-grey-light border p-2 sm:border-0" style="width: 100px;">序號</th>
            <th class="border-grey-light border p-2 sm:border-0">姓名</th>
            <th class="border-grey-light border p-2 sm:border-0">暱稱</th>
            <th class="border-grey-light border p-2 sm:border-0">性別</th>
            <th class="border-grey-light border p-2 sm:border-0">等級</th>
            <th class="border-grey-light border p-2 sm:border-0">信箱</th>
            <th class="border-grey-light border p-2 sm:border-0">電話</th>
            <th class="border-grey-light border p-2 sm:border-0">操作</th>
          </tr>
        </thead>
        <tbody class="flex-1 sm:flex-none">
          <tr v-for="(user, index) in users"
            class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
            <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
            <td class="border-grey-light border p-2">
                <a class="text-blue-500" href="###" @click="userModal_open(index)"><span v-text="user.name"></span></a>
            </td>
            <td class="border-grey-light border p-2"><span v-text="user.nick"></span></td>
            <td class="border-grey-light border p-2"><span v-text="user.gender"></span></td>
            <td class="border-grey-light border p-2 text-right"><span v-text="user.level"></span></td>
            <td class="border-grey-light border p-2"><span v-text="user.email"></span></td>
            <td class="border-grey-light border p-2"><span v-text="user.phone"></span></td>
            <td class="border-grey-light border p-1">
              <div class="sm:flex block justify-around mt-0.5">
                <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                        @click="userModal_open(index)">
                  <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="sm:mr-0 mr-2  rounded bg-red-500 border-2 border-red-700"
                        @click="user_delete(index)">
                  <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                </button>
              </div>
            </td>
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