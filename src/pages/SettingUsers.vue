<script setup>
  import { ref, reactive, inject, provide } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalUserEditor from '../components/ModalUserEditor.vue';
  import NavSetting from '../components/NavSetting.vue';
  import Leftmenu from '../components/Leftmenu.vue';
  import UserList from '../components/UserList.vue';
  import * as functions from '../functions.js';
  import * as Icon from '@heroicons/vue/24/outline';
  const toast = useToast();
  const swal = inject('$swal');

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
    await get_users();
  } 

  // 單一新增/編輯人員-------------------------------------------------------------------------
  const refModalUserEditor = ref(null);
  const userModal_open = (user_index=-1) => {
    let target_user = user_index!=-1 ? Object.assign({}, users[user_index]) : null;
    refModalUserEditor.value.set_user(user_index, target_user);
  }
  const change_user_data = (user_index, user_data) => {
    if(refModalUserEditor.value.userModal.index==-1){
      users.unshift(user_data);
    }else{
      let user_keys = Object.keys(user_data);
      user_keys.forEach(key => { users[user_index][key] = user_data[key] });
    }
  }

  // 人員列表-------------------------------------------------------------------------
  let users = reactive([]);
  let users_input_data = ref('');
  const add_users = async() => {
    let data = users_input_data.value;
    data = data.split("\n");
    data = data.map((item)=>{ 
      item = item.split("."); 
      item = item.length>1 ? item.slice(1) : item;
      item = item.join(".").trim();
      return item;
    });
    data = data.filter((item)=>{ return item.trim() });
    // console.log(data);return;
    if(data.length==0){ 
      toast.warning('請輸入員名稱');return;
    }
    refFirebase.value.set_body_block_show_long(true);

    let new_data = [];
    for (let i = 0; i < data.length; i++) {
      let user_id = '';
      const d = data[i].trim();
      if(d){
        let target_user = {name:d};
        let repeat_users = await refFirebase.value.db_get_data('users', [['name', '==', d]]);
        if(repeat_users.length<=0){
          new_data.push({name:d});
        }
        else{
          let button_html = '<button class="btn user px-2 py-2 mx-3 my-2 rounded bg-red-600 text-white" index="強制建立">強制建立</button>';
          for (let x = 0; x < repeat_users.length; x++) {
            const repeat = repeat_users[x];
            const gender_class = repeat.gender=='女' ?'bg-red-300 border-red-400' : 'bg-blue-300 border-blue-400';
            button_html += '<button class="btn inline-flex user px-2 py-2 mx-3 my-2 rounded '+ gender_class +'" index="'+ x +'" user_id="'+ repeat.id +'">'+ 
                              repeat.name + 
                              '<span class="eye ml-3" user_id="'+ repeat.id +'" class="ml-3">\
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">\
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />\
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />\
                                </svg>\
                              </span>\
                            </button>';
          }
          await swal({
            title: '有重複人員：' + d,
            text: "是否建立資料？",
            icon: 'warning',
            html: button_html,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: '跳過',
            didOpen: () => {
              document.querySelectorAll('button.user .eye').forEach(element => {
                element.addEventListener('click', (e) => {
                  const user_id = element.getAttribute('user_id');
                  toggle_menu_open_left_id(user_id);
                  setTimeout(()=>{
                    let class_text = document.querySelector('.left_menu').getAttribute('class') + ' very_front ';
                    document.querySelector('.left_menu').setAttribute('class', class_text);
                  }, 100);
                });
              });
              document.querySelectorAll('button.user').forEach(element => {
                element.addEventListener('click', async(e) => {
                  if(e.target != e.currentTarget){ return; }
                  const index = element.getAttribute('index');
                  if(index=='強制建立'){
                    new_data.push({name:d});
                  }else{
                    const user_id = element.getAttribute('user_id');
                    toggle_menu_open_left_id(user_id);
                    setTimeout(()=>{
                      let class_text = document.querySelector('.left_menu').getAttribute('class') + ' very_front ';
                      document.querySelectorAll('.left_menu').forEach(element => {
                        element.setAttribute('class', class_text);
                      });
                    }, 100);
                    return;
                  }
                  swal.close();
                });
              });
            }
          });
          if(target_user){ user_id = target_user.id; }
        }
        if(user_id){
          const add_result = await refFirebase.value.add_game_date_users(game_date_id.value, user_id);
          if(add_result){
            changed = true;
          }else{
            toast.info("此人員已加入該打球日中");
          }
        }
      }
    }
    users_input_data.value = '';

    if(new_data.length>0){
      let ids = await refFirebase.value.db_set_data('users', new_data);
      await get_users();
      toast.success('新增成功');
    }
    refFirebase.value.set_body_block_show_long(false);
  }
  const get_users = async() => {
    users.splice(0, users.length);
    let user_data = await refFirebase.value.db_get_data('users');
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
        await refFirebase.value.db_delete_data('users', users[user_index].id);
        users.splice(user_index, 1);
      }
    });
  }

  // 左側人員詳細料面板-------------------------------------------------------------------------
  const refLeftmenu = ref(null);
  const toggle_menu_open_left = async(user_index=-1)=>{
    await refLeftmenu.value.toggle_menu_open_left(user_index);
  }
  const toggle_menu_open_left_id = async(user_id=-1)=>{
    await refLeftmenu.value.toggle_menu_open_left_id(user_id);
  }
  provide('toggle_menu_open_left', toggle_menu_open_left);
  provide('toggle_menu_open_left_id', toggle_menu_open_left_id);
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <ModalUserEditor @change_user_data="change_user_data" :users="users" 
                  ref="refModalUserEditor" :refLeftmenu="refLeftmenu">
  </ModalUserEditor>
  <NavSetting></NavSetting>

  <div class="p-2">
    <h1 class="text-xl font-bold">人員列表</h1>
    <h3 class="">批次新增人員(請輸入人名並以「換行」分隔，人名會省略第一個點(.)之前的文字及前後多於空白</h3>
    <textarea class="w-full" rows="2" v-model="users_input_data" 
placeholder="1.陳XX
王OO"></textarea>
    <p class="text-red-600">※此處新增不會檢查資料庫是否重複，因為姓名可重複</p>
    <button @click="add_users"
            class="w-full font-bold py-1 px-4 border-b-4 rounded
                bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500">
        批次新增
    </button>
    <hr class="my-3">
    <div>
      <button class="flex items-center font-bold py-1 px-4 ml-2 border-b-4 rounded text-white
                     bg-yellow-500 hover:bg-yellow-400 border-yellow-700 hover:border-yellow-500" 
              @click="userModal_open(-1)">
        <span class="mr-2">單一新增</span>
        <Icon.UserPlusIcon class="h-5 w-5 text-white"></Icon.UserPlusIcon>
      </button>
    </div>
    <UserList :users="users" @userModal_open="userModal_open" @user_delete="user_delete"></UserList>
  </div>

  <Leftmenu :users="users" :need_user_delete="false"
            @userModal_open="userModal_open" ref="refLeftmenu">
  </Leftmenu>
</template>

<style scoped>
  textarea{
    min-height: 2.5rem;
  }
</style>