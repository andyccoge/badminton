<script setup>
  import { ref, reactive, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import Modal from '../components/Modal.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');

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
          button_html += '<button class="btn user px-2 py-2 mx-3 my-2 rounded '+ gender_class +'" index="'+ x +'">'+ 
                            repeat.name + 
                            '('+ (repeat.nick ? repeat.nick+' ': '') + functions.stamp_to_time(repeat.create_time) +')\
                          </button>';
        }
        await swal({
          title: '有重複人員：' + target_user.name,
          text: "無法判別人員，請透過單一設定選擇",
          icon: 'warning',
          html: button_html,
          showConfirmButton: true,
          confirmButtonText: '跳過',
          confirmButtonColor: '#6e7881',
          didOpen: () => {
            document.querySelectorAll('button.user').forEach(element => {
              element.addEventListener('click', async(e) => {
                refFirebase.value.set_body_block_show_top(true);
                let index = element.getAttribute('index');
                if(index=='強制建立'){
                  target_user = await refFirebase.value.db_add_data('users', target_user);
                }else{
                  if(game_date_id){
                    target_user = repeat_users[index];
                  }else{
                    target_user = null;
                  }
                }
                refFirebase.value.set_body_block_show_top(false);
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