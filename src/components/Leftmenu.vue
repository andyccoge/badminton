<script setup>
  import { ref } from 'vue';
  import Firebase from '../components/Firebase.vue';
  import * as Icon from '@heroicons/vue/24/outline';

  const refFirebase = ref(null);

  const menu_open_left = ref(false);
  const user_view_index = ref(-1);
  const props = defineProps({
    users: Array,
    need_user_date_info: Boolean,
    need_user_edit: Boolean,
    need_user_delete: Boolean,
  });
  
  const emit = defineEmits(['change_user_data', 'user_delete', 'userModal_open']);

  const set_paid_status = async(date_user_id, paid_status) => {
    const result = await refFirebase.value.db_update_data('game_date_users', date_user_id, {'paid': paid_status});
    let target_user = JSON.parse(JSON.stringify(props.users[user_view_index.value]));
    target_user.paid = paid_status;
    if(result){ emit('change_user_data', user_view_index.value, target_user); }
  }
  
  const toggle_menu_open_left = (user_index=-1)=>{
    if(user_index==-1){
      if(menu_open_left.value){
          menu_open_left.value = false;
      }else{
          menu_open_left.value = true;
      }
    }else{
      menu_open_left.value = true;
      user_view_index.value = user_index;
    }
  }
  const toggle_menu_open_left_id = (user_id=-1) => {
    for (let index = 0; index < props.users.length; index++) {
      if(props.users[index].id==user_id){
        toggle_menu_open_left(index);
        break;
      }
    }
  }
  defineExpose({
    toggle_menu_open_left,
    toggle_menu_open_left_id,
  });
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>

  <Transition>
    <div v-show="menu_open_left && props.users.length>user_view_index && user_view_index>=0" 
         class="modal-mask left_menu" @click.self="toggle_menu_open_left(-1)">
      <nav v-if="menu_open_left && props.users.length>user_view_index && user_view_index>=0"
           class="p-4" :class="[props.users[user_view_index].gender=='女'? 'bg-red-300' : 'bg-blue-300']">
        <button class="absolute right-0 top-0 p-1" @click="toggle_menu_open_left(-1)">
          <Icon.XCircleIcon class="h-6 w-6 text-black bg-white rounded-full"></Icon.XCircleIcon>
        </button>
        <div class="nav_content h-full bg-white p-4 rounded-md">
          <div class="nav_content_inner h-full">
            <h3 class="font-bold text-xl mb-2">詳細資料</h3>
            <p>姓名：{{props.users[user_view_index].name}}</p>
            <p>綽號：{{props.users[user_view_index].nick}}</p>
            <p>性別：{{props.users[user_view_index].gender}}</p>
            <p>等級：{{props.users[user_view_index].level}}</p>
            <p>電話：{{props.users[user_view_index].phone}}</p>
            <p>信箱：{{props.users[user_view_index].email}}</p>
            <div v-if="props.need_user_date_info">
              <hr class="my-3">
              <p>是否付款：
                <span class="text-green-600" v-if="props.users[user_view_index].paid==1">已付清</span>
                <span class="text-red-600" v-else>未付</span>
                <button class="px-1 py-0.5 rounded text-white ml-2 bg-green-600"
                        @click="set_paid_status(props.users[user_view_index].date_user_id, 1)"
                        v-if="props.users[user_view_index].date_user_id && props.users[user_view_index].paid!=1">設定已付清</button>
                <button class="px-1 py-0.5 rounded text-white ml-2 bg-red-600"
                        @click="set_paid_status(props.users[user_view_index].date_user_id, 0)"
                        v-if="props.users[user_view_index].date_user_id && props.users[user_view_index].paid==1">設定未付
                </button>
              </p>
              <p>今日比賽場數：{{props.users[user_view_index].played}}</p>
              <p>等待場數：{{props.users[user_view_index].wait}}</p>
              <p>
                狀態：
                <span v-if="props.users[user_view_index].status==1">場上</span>
                <span v-else >閒置</span>
              </p>
            </div>
            <div v-if="props.need_user_edit || props.need_user_delete">
              <hr class="my-3">
              <div class="flex justify-between">
                <button class="mx-2" @click="emit('userModal_open', user_view_index);" v-if="props.need_user_edit">
                  <Icon.PencilSquareIcon class="h-5 w-5 text-black"></Icon.PencilSquareIcon>
                </button>
                <button class="mx-2" @click="emit('user_delete', user_view_index);" v-if="props.need_user_delete">
                  <Icon.TrashIcon class="h-5 w-5 text-black"></Icon.TrashIcon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </Transition>
</template>

<style scoped>
  .modal-mask.very_front{
    z-index: 99999;
  }

  nav{
    position: fixed;
    width: 60%;
    height: 100%;
    max-width: 400px;
    z-index: 15;
    box-shadow: 0 0px 20px rgb(0 0 0 / 33%);
  }
  .nav_content{
    overflow-x: scroll;
  }
  .nav_content_inner{
    min-width: 140px;
  }

  .modal-mask {
    position: fixed;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }

  .v-enter-active nav,
  .v-leave-active nav{
    transition-duration: 0.5s;
    left: 0%;
  }

  .v-enter-from nav,
  .v-leave-to nav{
    left: -50%;
  }

  @media only screen and (min-width: 976px){
    nav{
      width: 30%;
    }
    .v-enter-from nav,
    .v-leave-to nav{
      left: -30%;
    }
  }
</style>
  