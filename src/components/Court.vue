<script setup>
  import { ref, inject, computed } from 'vue';
  import * as functions from '../functions.js';
  const props = defineProps({
    court: Object,
    court_index: Number,
  });
  const court_img = ref('/src/assets/img/badminton_court_e.png');
  // const court_img = ref('/src/assets/img/badminton_court_v_e.png');
  
  const users = inject('users');
  const court_eidt = inject('court_eidt');
  const court_delete = inject('court_delete');
  const court_start = inject('court_start');
  const court_stop = inject('court_stop');
  const court_repeat = inject('court_repeat');
  const court_next = inject('court_next'); 
  
  const chage_user = inject('chage_user');
  const court_chage_user = inject('court_chage_user');
  const toggle_menu_open_left_id = inject('toggle_menu_open_left_id');
  const userModal_open_id = inject('userModal_open_id');
  
  const court_delete_user = inject('court_delete_user');

  const game_time = computed(()=> {
      if(props.court.time==0){ return '00：00'; }
      else{
        let minute = Math.floor((props.court.time / 60)).toFixed(0);
        let second = (props.court.time % 60).toFixed(0);
        return minute.padStart(2, 0) + '：' + second.padStart(2, 0);
      }
  });

  const check_on_court = inject('check_on_court');

  const contest_record = inject('contest_record');
  const repeat_player = computed(()=> {
    let repeat = false;
    let all_player = [];
    for (let x = 0; x < props.court.users.length; x++) {
      for (let y = 0; y < props.court.users[x].length; y++) {
        const element = props.court.users[x][y];
        if(element!=0){ all_player.push(element); }
      }
    }

    for (let i = 0; i < contest_record.length; i++) {
      let same_player = 0;
      const record = contest_record[i];
      for (let x = 0; x < record.users.length; x++) {
        for (let y = 0; y < record.users[x].length; y++) {
          const id = record.users[x][y];
          if(all_player.indexOf(id)!=-1){
            same_player += 1;
          }
        }
        if(same_player / all_player.length >= 0.75){
          repeat = true;
          break;
        }
      }
      if(repeat){ break; }   
    }
    return repeat;
  });
</script>

<template>
  <div>
    <div class="mt-4 flex align-center justify-center">
      <div class="inline-flex align-center justify-between
                  font-bold py-1 px-2 border-b-4 rounded-t-lg 
                  bg-red-500 hover:bg-red-400 border-red-700 hover:border-red-500">
        <button class="px-2" @click="court_eidt(props.court_index)" v-if="court.type==1">
          <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button class="px-2" @click="court_delete(props.court_index)">
          <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
        </button>
        <template v-if="props.court.type==1">
          <!-- <button class="px-2" @click="court_repeat(props.court_index)">
            <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />  <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3-3l3-3" />  <path d="M11 11l1 -1v4" /></svg>
          </button> -->
          <button class="px-2" @click="court_next(props.court_index)">
            <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="5" cy="18" r="2" />  <circle cx="19" cy="6" r="2" />  <path d="M19 8v5a5 5 0 0 1 -5 5h-3l3 -3m0 6l-3 -3" />  <path d="M5 16v-5a5 5 0 0 1 5 -5h3l-3 -3m0 6l3 -3" /></svg>
          </button>
        </template>
      </div>
    </div>
    <div class="court sm:aspect-video aspect-[4/4] border-2 rounded-xl relative flex flex-col justify-center"
          :class="[props.court.type==1 ? 'bg-green-500/80 hover:bg-green-600' : 'bg-yellow-500/80 hover:bg-yellow-600']"
    >
      <img :src="court_img" class="court_img w-full h-full absolute opacity-75 z-0"/>
      <span class="alert_dot flex h-3 w-3 mr-2 absolute" v-if="repeat_player && court.type==0">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-700 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
      </span>
      <div class="flex items-center h-full z-10">
        <div class="absolute h-full w-full flex items-center justify-center z-5">
          <h3 class="text-center font-semibold sm:text-lg
                      w-8 p-2 cursor-pointer bg-white/50"
              @click="court_eidt(props.court_index)"
              v-if="court.type==1"
              v-text="props.court.name">
          </h3>
        </div>
        <div class="w-full grid gap-0 grid-cols-2 z-10">
          <div class="text-center sm:text-md text-sm py-1 flex flex-col justify-center" v-for="(group, group_index) in props.court.users">
            <div :class="[group_index%2==0 ? 'mr-6 ml-2' : 'ml-6 mr-2']" class="bg-white/50 px-1"
                  v-for="(user_id, user_index) in group">
              <span class="w-full inline-flex sm:flex-row flex-col sm:h-8 h-fit items-center my-2 cursor-pointer" 
                    :class="{'bg-red-500' :chage_user.court_index==court_index && chage_user.user_group==group_index && chage_user.user_index==user_index}"
              >
                <span class="name_tag mh-6 font-semibold relative"
                      @click.self="court_chage_user(props.court_index, group_index, user_index)">
                  <span class="line-clamp-2" :class="{'opacity-30' : check_on_court(user_id) && court.type==0}"
                      @click.self="court_chage_user(props.court_index, group_index, user_index)"
                      v-text="functions.get_user_name(users, user_id)" >
                  </span>
                  <span class="hidden court_user_panel absolute bg-slate-800 w-fit rounded px-1 flex-col sm:flex-row" v-if="user_id!=0">
                    <button class="py-1 mx-2" @click="toggle_menu_open_left_id(user_id)">
                      <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button class="py-1 mx-2" @click="userModal_open_id(user_id)">
                      <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                  </span>
                </span>
                <button class="sm:ml-2 sm:mt-0 ml-0 mt-2" v-if="user_id!=0"
                        @click="court_delete_user(props.court_index, group_index, user_index)">
                  <svg class="h-5 w-5 text-black"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                </button>
              </span>
              <div v-if="user_index+1<group.length" class="border-b-2 border-black"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full flex align-center justify-center relative" v-if="props.court.type==1">
      <div class="flex relative items-center justify-around py-1 sm:px-4 px-4 pr-1 bg-slate-800 text-white min-w-[50%] rounded-b">
        <span class="alert_dot flex h-3 w-3 absolute" v-if="props.court.time <= 10 || !court.timer">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-700 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </span>
        <span v-text="game_time"></span>
        <template v-if="props.court.type==1">
          <button class="sm:pl-0 sm:pr-2 sm:absolute pl-4 right-0" @click="court_start(props.court_index)" v-if="!court.timer">
            <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M18 15l-6-6l-6 6h12" transform="rotate(90 12 12)" /></svg>
          </button>
          <button class="sm:pl-0 sm:pr-2 sm:absolute pl-4 right-0" @click="court_stop(props.court_index)" v-if="court.timer">
            <svg class="h-5 w-5 text-white"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <rect x="6" y="4" width="4" height="16" />  <rect x="14" y="4" width="4" height="16" /></svg>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
  main{
    margin-top: var(--nav_h);
  }

  img{
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
  .name_tag{
    width: -webkit-fill-available;
  }

  .mh-6{
    min-height: 1.2rem;
  }

  /* .court_user_panel{
    bottom: -1.75rem;
  } */
  .name_tag:hover .court_user_panel{
    display: flex;
  }

  .alert_dot{
    top: -5px;
    right: -5px;
  }
</style>