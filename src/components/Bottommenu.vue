<script setup>
  import { ref, provide, inject, readonly, computed, watch } from 'vue';
  import * as functions from '../functions.js';
  import User from './User.vue';
  import Draggable from 'vuedraggable';
  import * as Icon from '@heroicons/vue/24/outline';

  const users = inject('users');
  const courts = inject('courts');

  const court_chage_user_reset = inject('court_chage_user_reset');
  let menu_open = inject('menu_open_bottom') ? inject('menu_open_bottom') : ref(false);
  const toggle_menu_open =()=>{
      if(court_chage_user_reset){ court_chage_user_reset(); }
      if(menu_open.value){
          menu_open.value = false;
          grouping_users_toggle(-1);
      }else{
          menu_open.value = true;
      }
  }

  let bottom_nav_more = inject('bottom_nav_more') ? inject('bottom_nav_more') : ref(true);
  const toggle_bottom_nav_more =()=>{
      bottom_nav_more.value = bottom_nav_more.value ? false : true;
  }

  let alert_wait = ref(99);
  const init_alert_wait = () => {
    alert_wait.value= courts.filter(court => court.type==1).length;
  }
  provide('alert_wait', readonly(alert_wait));

  const check_on_court = inject('check_on_court') ? inject('check_on_court') : ()=>{return false;};
  const user_order_type = ref('normal');
  const users_by_teams = inject('users_by_teams') ? inject('users_by_teams') : [];
  const users_show_by_normal = computed(()=>{
    let user_data = [];
    let [first, second, third, fourth] = [[], [], [], []];
    for (let x = 0; x < users.length; x++) {
      const user = users[x];
      const prepare = check_on_court(user.id, 0);
      const playing = check_on_court(user.id, 1);
      if(!prepare && !playing){ first.push(user); }
      else if(prepare && !playing){ second.push(user); }
      else if(!prepare && playing){ third.push(user); }
      else if(prepare && playing){ fourth.push(user); }
    }
    user_data = user_data.concat(first.sort((a,b) => (a.played > b.played) ? 1 : ((b.played > a.played) ? -1 : 0)))
    user_data = user_data.concat(second.sort((a,b) => (a.played > b.played) ? 1 : ((b.played > a.played) ? -1 : 0)))
    user_data = user_data.concat(third.sort((a,b) => (a.played > b.played) ? 1 : ((b.played > a.played) ? -1 : 0)))
    user_data = user_data.concat(fourth.sort((a,b) => (a.played > b.played) ? 1 : ((b.played > a.played) ? -1 : 0)))
    return user_data;
  });
  const users_show_by_self = ref([]);
  watch(users, () => {
    let new_ids = [];
    users.forEach(element => { new_ids.push(element.id); });

    let element_changed = false;
    if(new_ids.length != users_show_by_self.value.length){
      element_changed = true;
    }else{
      for (let x = 0; x < new_ids.length; x++) {
        if(users_show_by_self.value.indexOf(new_ids[x])==-1){
          element_changed = true;
        }
      }
    }

    if(element_changed){
      users_show_by_self.value = [];
      setTimeout(()=>{ users_show_by_self.value = new_ids; }, 100);
    }
  }, {
    immediate: true
  });
  const users_show_by_team = computed(()=>{
    let user_data = [];
    let has_add_ids = [];
    users_by_teams.forEach(team => {
      team.forEach(user_id => {
        for (let x = 0; x < users.length; x++) {
          if(users[x].id == user_id){ 
            user_data.push(users[x]);
            has_add_ids.push(users[x].id);
            break;
          }
        }
      });
    });

    for (let x = 0; x < users.length; x++) {
      if(has_add_ids.indexOf(users[x].id)==-1){
        user_data.push(users[x]);
      }
    }
    return user_data;
  });

  const grouping_users_mode = inject('grouping_users_mode');
  const grouping_users_toggle = inject('grouping_users_toggle');
  const grouping_users = inject('grouping_users');
  
  let userModal_open = inject('userModal_open');

  defineExpose({
    init_alert_wait, /* 初始化等候提醒數 */
  });
</script>

<template>
  <div class="bottom_nav_leave_blank pt-20"></div>
  <nav>
    <div class="btn absolute w-full">
      <div class="container mx-auto px-1">
        <button class="w-full font-bold py-2 px-4 border-b-4 rounded-t-lg text-white relative"
                :class="[grouping_users_mode ? 'bg-black hover:bg-black  border-black hover:border-black' : 'bg-red-500 hover:bg-red-400  border-red-700']"
                @click.self="toggle_menu_open">
          人員面板
          <span v-if="grouping_users_mode">(群組模式)</span>
          <span class="absolute left-2">
            <button class="" v-if="!bottom_nav_more" @click="toggle_bottom_nav_more">
              <Icon.Bars2Icon class="h-5 w-5 text-white"></Icon.Bars2Icon>
            </button>
            <button class="" v-if="bottom_nav_more" @click="toggle_bottom_nav_more">
              <Icon.Bars3Icon class="h-5 w-5 text-white"></Icon.Bars3Icon>
            </button>
          </span>
          <span class="absolute right-2">
            <button class="mx-2" @click="grouping_users_toggle">
              <Icon.RectangleGroupIcon class="h-5 w-5 text-white"></Icon.RectangleGroupIcon>
            </button>
            <button class="" @click="userModal_open(-1)">
              <Icon.UserPlusIcon class="h-5 w-5 text-white"></Icon.UserPlusIcon>
            </button>
          </span>                    
        </button>
      </div>
    </div>
    <Transition>
      <div class="border-4 border-b-0 rounded-t-lg px-3 py-2 bg-white" v-show="menu_open"
          :class="[grouping_users_mode ? 'border-black' : 'border-red-700']">
        <div v-if="bottom_nav_more">
          排序方式：<select class="py-0.5 mr-2" v-model="user_order_type">
            <option value="normal">一般</option>
            <option value="self">自訂</option>
            <option value="team">群組</option>
          </select>
          <span v-if="user_order_type=='normal'">※依未準備、準備中、比賽中分組，各組再依完賽數由小到大排序</span>
          <span v-if="user_order_type=='self'">※如有新增、刪除人員資料，會重置排序</span>
        </div>
        <div class="nav_content" v-show="user_order_type=='normal'">
          <template v-for="user in users_show_by_normal">
            <User :users="users" :user="user"></User>
          </template>
        </div>
        <div class="nav_content draggable_container" v-show="user_order_type=='self'">
          <template v-if="users_show_by_self.length>0">
            <Draggable :list="users_show_by_self" item-key="id">
              <template #item="{element}">
                <div>
                  <template v-for="user in users">
                    <template v-if="user.id == element">
                      <User :users="users" :user="user"></User>
                    </template>
                  </template>
                </div>
              </template>
            </Draggable>
          </template>
        </div>
        <div class="nav_content" v-show="user_order_type=='team'">
          <template v-for="user in users_show_by_team">
            <User :users="users" :user="user"></User>
          </template>
        </div>
        <div class="grid lg:grid-cols-2 md:grid-cols-1" v-if="!grouping_users_mode && bottom_nav_more">
          <div>
            ※透明表示目前正在場上，但仍可安排上場<br>
            ※黃框表示有排上預備場<br>
            ※點擊場地人員區塊即可開始指派人員
          </div>
          <div class="flex items-end justify-end">
            等候場數提示：<input type="number" class="form-input px-1 py-1 rounded" min="0" v-model="alert_wait"/>
          </div>
        </div>
        <button class="my-2 w-full font-bold py-2 px-4 rounded-md text-white bg-black" v-if="grouping_users_mode"
                @click="grouping_users">
          將所選人員建成群組
        </button>
      </div>
    </Transition>
  </nav>
  <div v-if="menu_open" class="bottom_nav_open_leave_blank"></div>
</template>

<style scoped>
  nav{
    position: fixed;
    width: 100%;
    z-index: 10;
    bottom: 0;
  }
  nav div.btn{
    top: -42px
  }

  .nav_content{
    padding-top: 5px;
    /* padding-right: 5px; */
    overflow-y: scroll;
  }
  .bottom_nav_open_leave_blank,
  .nav_content{
    height: 50vh;
  }
  .v-enter-active,
  .v-leave-active{
    transition-duration: 0.1s;
    height: 50vh;
  }

  @media only screen and (min-width: 976px){
    .bottom_nav_open_leave_blank,
    .nav_content{
      height: 30vh;
    }
    .v-enter-active,
    .v-leave-active{
      transition-duration: 0.1s;
      height: 30vh;
    }
  }

  .v-enter-from,
  .v-leave-to{
    height: 0px;
      
  }

  .draggable_container>div{
    display: flex;
    flex-wrap: wrap;
  }
</style>
  