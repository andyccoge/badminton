<script setup>
  import { ref, reactive, inject, provide } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import Modal from '../components/Modal.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');

  const props = defineProps({
    users: Array,
    refLeftmenu: Object,
  });

  const refFirebase = ref(null);
  
  const game_date_id = inject('game_date_id');

  let userModal  = reactive({ 
    show:false, index:-1, 
    user:{id:0, name:'', nick:'', gender:"", level:0, phone:'', email:'', played:0, wait:0, status:0}
  });
  const emit = defineEmits(['change_user_data']);

  /* level：等級、played：已比場數、wait：等候場數、status:狀態0.閒置 1.場上 */
  const user_empty = {id:null, name:'', nick:'', gender:"", level:0, phone:'', email:''};
  let userModal_keys = Object.keys(user_empty);
  const userModal_user_name = ref(null);
  const userModal_user_level = ref(null);

  /* 設定跳出視窗內的人員資料 */
  const set_user = (user_index, target_user) => {
    userModal.show = true;
    userModal.index = user_index;
    if(target_user){
      userModal.user = target_user;
    }else{
      userModal_keys.forEach(key => { userModal.user[key] = user_empty[key] });
    }
    setTimeout(()=>{ userModal_user_name.value.focus() }, 100);
  }

  const user_save = async() => {
    if(!userModal.user.name){ toast.warning("請輸入姓名");return; }
    let target_user = JSON.parse(JSON.stringify(userModal.user));

    refFirebase.value.set_body_block_show_long(true);
    if(userModal.index==-1){
      let repeat_users = await refFirebase.value.db_get_data('users', [['name', '==', target_user.name]]);
      if(repeat_users.length==0){
        target_user = await refFirebase.value.db_add_data('users', target_user);
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
          title: '有重複人員：' + target_user.name,
          text: "",
          icon: 'warning',
          html: button_html,
          showConfirmButton: true,
          confirmButtonText: '跳過',
          confirmButtonColor: '#6e7881',
          didOpen: () => {
            document.querySelectorAll('button.user .eye').forEach(element => {
              element.addEventListener('click', (e) => {
                const user_id = element.getAttribute('user_id');
                props.refLeftmenu.toggle_menu_open_left_id(user_id);
                setTimeout(()=>{
                  let class_text = document.querySelector('.left_menu').getAttribute('class') + ' very_front ';
                  document.querySelectorAll('.left_menu').forEach(element => {
                    element.setAttribute('class', class_text);
                  });
                }, 100);
              });
            });
            document.querySelectorAll('button.user').forEach(element => {
              element.addEventListener('click', async(e) => {
                let index = element.getAttribute('index');
                if(index=='強制建立'){
                  refFirebase.value.set_body_block_show_top(true);
                  target_user = await refFirebase.value.db_add_data('users', target_user);
                  refFirebase.value.set_body_block_show_top(false);
                }else{
                  if(e.currentTarget!=e.target){ return; }
                  if(game_date_id){
                    target_user = repeat_users[index];
                  }else{
                    target_user = null;
                    const user_id = element.getAttribute('user_id');
                    props.refLeftmenu.toggle_menu_open_left_id(user_id);
                    setTimeout(()=>{
                      let class_text = document.querySelector('.left_menu').getAttribute('class') + ' very_front ';
                      document.querySelectorAll('.left_menu').forEach(element => {
                        element.setAttribute('class', class_text);
                      });
                    }, 100);
                    return;
                  }
                }
                swal.close();
              });
            });
          }
        }).then((result) => {
          if(result.isConfirmed){
            target_user = null;
          }
        });
      }
      if(game_date_id && target_user){
        const add_result = await refFirebase.value.add_game_date_users(game_date_id.value, target_user.id);
        if(add_result){
          target_user = functions.merge_user_and_date_user_data(target_user, add_result);
        }else{
          target_user = null;
          toast.info("此人員已加入該打球日中");
        }
      }
    }else{
      if(target_user.date_user_id){
        await refFirebase.value.db_update_data('game_date_users', target_user.date_user_id, target_user);
      }
      const update_result = await refFirebase.value.db_update_data('users', target_user.id, target_user);
      if(!update_result){ target_user = null; }
    }
    refFirebase.value.set_body_block_show_long(false);

    if(target_user){
      toast.success("資料已儲存");
      if(userModal.index==-1){
        userModal.user = JSON.parse(JSON.stringify(user_empty));
      }
      emit('change_user_data', userModal.index, target_user);
    }
  }

  defineExpose({
    userModal,
    set_user,
  })
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>

  <!-- 新增/編輯人員 -->
  <modal :show="userModal.show" @close="userModal.show = false;">
    <template #header>
      <h3 class="font-bold text-xl" v-if="userModal.index==-1">新增人員</h3>
      <h3 class="font-bold text-xl" v-if="userModal.index!=-1">編輯人員</h3>
    </template>
    <template #body>
      <div class="mb-2">
        姓名：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_name"
                    v-model="userModal.user.name" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        綽號：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_nick"
                    v-model="userModal.user.nick" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        性別：
        <input type="radio" id="gender_1" ref="userModal_user_gender_男" value="男" class="mr-1"
                    v-model="userModal.user.gender" @click="userModal_user_level.focus()"/>
        <label for="gender_1" class="mr-4">男</label>
        <input type="radio" id="gender_0" ref="userModal_user_gender_女" value="女" class="mr-1"
                    v-model="userModal.user.gender" @click="userModal_user_level.focus()"/>
        <label for="gender_0">女</label>
      </div>
      <div class="mb-2">
        等級：<input type="number" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_level"  min="0" step="1"
                    v-model="userModal.user.level" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        電話：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_phone"
                    v-model="userModal.user.phone" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        信箱：<input type="email" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_email"
                    v-model="userModal.user.email" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2" v-if="userModal.user.date_user_id">
        付款：
        <input type="radio" id="paid_1" ref="userModal_user_paid_1" value="1" class="mr-1"
                    v-model="userModal.user.paid"/>
        <label for="paid_1" class="mr-4">已付清</label>
        <input type="radio" id="paid_0" ref="userModal_user_paid_0" value="0" class="mr-1"
                    v-model="userModal.user.paid"/>
        <label for="paid_0">未付</label>
      </div>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500'"
              @click="user_save">
        確認儲存
      </button>
    </template>
  </modal>
</template>

<style scoped>
</style>