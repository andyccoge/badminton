<script setup>
  import { ref, reactive, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import * as functions from '../functions.js';
  import Modal from '../components/Modal.vue';
  const toast = useToast();
  const swal = inject('$swal');

  const check_on_court = inject('check_on_court') ? inject('check_on_court') : ()=>{return 0;}

  const data_empty = {id:null, diff_level_sum:0, diff_level_divi:0, woman_level_deduct:0, no_deduct_level:0};
  const refFirebase = ref(null);
  const sign_in_success = async() => {
    const datas = await refFirebase.value.db_get_data('auto_set_user_setting');
    if(datas.length>0){ modal.data = datas[0]; }
    else{
      modal.data = JSON.parse(JSON.stringify(data_empty));
    }
  }

  const emit = defineEmits([]);

  const modal = reactive({ 
    show: false, 
    data: JSON.parse(JSON.stringify(data_empty)),
  });

  /* 儲存設定 */
  const save = async() => {
    console.log(modal.data);
    if(modal.data.id){ /* 編輯 */
      await refFirebase.value.db_update_data('auto_set_user_setting', modal.data.id, modal.data);
    }else{ /* 新增 */
      const result = await refFirebase.value.db_add_data('auto_set_user_setting', modal.data);
      modal.data.id = result.id;
    }
    toast.success('已儲存設定');
  }

  /* 控制是否開啟視窗 */
  const toggle_modal = (status) => {
    modal.show = status;
  }

  /* 取得建議比賽組合 */
  const get_recommend_users = (court_index, users, courts=[], records=[]) => {
    users = JSON.parse(JSON.stringify(users));
    users.forEach((v,k) => {
      users[k].pre_paired = check_on_court(v.id, 0);
      users[k].playing = check_on_court(v.id, 1);
      users[k].level = get_calculate_level(v); /* 計算目標等級 */
    });
    var users = users.sort(function(a, b) { return a.pre_paired - b.pre_paired || a.playing - b.playing}); /* 依準備場次由少到多排序 及 比賽場次由多到少 */
    // console.log(get_data(users, 'nick'), get_data(users, 'pre_paired'), get_data(users, 'playing'));
  
    const all_rest_cond = [true, false]; /* 先要求全部閒置、再不依狀態取人 */
    for (let z = 0; z < all_rest_cond.length; z++) {
      const all_rest = all_rest_cond[z];
      let ids = get_next_user_with_status(court_index, users, courts, records, all_rest);
      if(ids!==null){ return ids; }
    }
    toast.warning('無可自動安排的組合');
  }
  const get_next_user_with_status = (court_index, users, courts, records, all_rest) => {
    const allow_repeat_limit = all_rest ? 5 : 6; /* 如果要求全部閒置，那允許重複數不可超過4(不允許隨機組) */
    for (let allow_repeat_num = 0; allow_repeat_num < allow_repeat_limit; allow_repeat_num++) {
      const group_result = init_group_data(users, courts[court_index]);
      const group = group_result['group'];
      const group_level_sum = group_result['group_level_sum'];

      if(allow_repeat_num==5){ users = functions.random_sort_array(users); }
      // console.log(allow_repeat_num);
      let result = get_next_user(users, group, group_level_sum, courts, records, allow_repeat_num, all_rest);
      if(result){ 
        let ids = result_get_ids(result);
        if(ids!==null){ return ids; }
      }
    }
    return null;
  }
  const init_group_data = (users, court) => {
    court = JSON.parse(JSON.stringify(court));
    const group_result = {};
    const group = {'group1':[], 'group2':[]};
    const group_level_sum = {'group1':0, 'group2':0};
    if(court.users[0].filter(user_id => user_id!='').length + 
       court.users[1].filter(user_id => user_id!='').length < 4){
      court.users.forEach((team, team_key)=> {
        team.forEach(user_id => {
          if(user_id!=''){
            for (let i = 0; i < users.length; i++) {
              if(users[i].id==user_id){
                group['group'+(team_key+1)].push(users[i]); 
                group_level_sum['group'+(team_key+1)] += users[i].level;
                break;
              }
            }
          }
        });
      });
    }
    group_result['group'] = group;
    group_result['group_level_sum'] = group_level_sum;
    // console.log(group_result);
    return group_result;
  }
  const get_next_user = (users, group, group_level_sum, courts=[], records=[], allow_repeat_num=0, all_rest=true) => {
    users = JSON.parse(JSON.stringify(users));
    group = JSON.parse(JSON.stringify(group));
    group_level_sum = JSON.parse(JSON.stringify(group_level_sum));
    courts = JSON.parse(JSON.stringify(courts));
    records = JSON.parse(JSON.stringify(records));
  
    for (let x = 0; x < users.length; x++) {
      let target_key = group.group1.length == group.group2.length ? 'group1' : 'group2';
      let target_index = group.group1.length == group.group2.length ? 0 : 1;
      const user = users[x];
      if(all_rest && user.playing!=0){ continue; } /* 若要求全部人都是閒置狀態 且 該人員有在比賽，則跳過 */
      // console.log(get_data(group['group1'],'name'), get_data(group['group2'],'name'), user.name);
      let target_user_level = user.level;
      let add_user = true;
      if(allow_repeat_num<=4){ /* 允許值小於等於4時 */
        /* 檢查兩兩等級差異 跟 是否加入過 */
        for (let y = 0; y < group['group1'].length; y++) {
          if(Math.abs(target_user_level - group['group1'][y].level) > modal.data.diff_level_divi 
             || group['group1'][y].id == user.id
          ){
            add_user = false;
          }
        }
        for (let y = 0; y < group['group2'].length; y++) {
          if(Math.abs(target_user_level - group['group2'][y].level) > modal.data.diff_level_divi
             || group['group2'][y].id == user.id
          ){
            add_user = false;
          }
        }
        /* 目前還需添加此人 */
        if(add_user){ 
          const ids = [['',''],['','']];
          group['group1'].forEach((v,k) => { ids[0][k] = v.id; });
          group['group2'].forEach((v,k) => { ids[1][k] = v.id; });
          ids[target_index][group[target_key].length] = user.id;
          /* 檢查是否跟場上組合重複 */
          for (let y = 0; y < courts.length; y++) {
            if(check_users_same(ids, courts[y]['users'], allow_repeat_num)){ add_user=false; break; }
          }
          /* 檢查是否跟比賽紀錄重複 */
          for (let y = 0; y < records.length; y++) {
            if(check_users_same(ids, records[y]['users'], allow_repeat_num)){ add_user=false; break; }
          }
        }
        /* 再加一人就滿了 且 目前還需添加此人 */
        if((group['group1'].length + group['group2'].length==3) && add_user){
          /* 檢查兩組等級總和差異 */
          let now_diff = Math.abs(group_level_sum['group1'] - group_level_sum['group2']);
          if(Math.abs(now_diff - target_user_level) > modal.data.diff_level_sum){
            add_user = false;
          }
        }
      }
      /* 經各種檢查後還需添加此人 */
      if(add_user){
        const next_group = JSON.parse(JSON.stringify(group));
        const next_group_level_sum = JSON.parse(JSON.stringify(group_level_sum));
        next_group[target_key].push(JSON.parse(JSON.stringify(user)));
        next_group_level_sum[target_key] += target_user_level;
        if(next_group['group1'].length + next_group['group2'].length==4){ return next_group; }

        let rest_users = JSON.parse(JSON.stringify(users));
        rest_users.splice(x, 1);
        if(rest_users.length>0){
          let result = get_next_user(rest_users, next_group, next_group_level_sum, courts, records, allow_repeat_num, all_rest);
          if(result){ 
            if(result['group1'].length + result['group2'].length==4){ return result; }
          }
        }
      }
    }
  }
  const get_calculate_level = (user) => {
    let calculate_level = user.level;
    if(user.gender=="女" && user.level < modal.data.no_deduct_level){
      calculate_level -= modal.data.woman_level_deduct;
    }
    return calculate_level;
  }
  const check_users_same = (group1, group2, allow_repeat_num=0) => {
    // console.log(group1);
    group1 = JSON.parse(JSON.stringify(group1));
    group2 = JSON.parse(JSON.stringify(group2));
    let group1_ids = [], group2_ids = [];
    let same_records = 0;
    for (let x = 0; x < group1.length; x++) {
      let group1_ids_sub = group1[x].sort();
      group1_ids = group1_ids.concat(group1[x]);
      group2_ids = group2_ids.concat(group2[x]);
      for (let y = 0; y < group2.length; y++) {
        let group2_ids_sub = group2[y].sort();
        let sub_same = true;
        for (let z = 0; z < group1_ids_sub.length; z++) {
          if(group1_ids_sub[z]!=group2_ids_sub[z] || (group1_ids_sub[z]=='' && group2_ids_sub[z]=='')){
            sub_same = false;
          }
        }
        if(sub_same){ same_records += 1; }
      }
    }
    
    let repeat_num = 0;
    for (let x = 0; x < group1_ids.length; x++) {
      const id = group1_ids[x];
      if(group2_ids.indexOf(id)!=-1 && id!=''){ repeat_num+=1; }
    }

    if(allow_repeat_num<=4){ /* 允許值小於等於4時 */
      if( repeat_num<=allow_repeat_num ){ /* 重複數小於允許值時 */
        return same_records==group1.length; /* 只要不完全重複就可 */
      }else{
        return true;  /* 視為重複 */
      }
    }else{ /* 允許值大於4時 */
      return false;  /* 視為不重複 */
    }
  }
  const result_get_ids = (result) => {
    let ids = [['',''],['','']];
    let all_has_user = true;
    for (let x = 0; x < ids[0].length; x++){
      if(typeof(result['group1'][x])!='undefined'){ ids[0][x] = result['group1'][x].id; }
      if(typeof(result['group2'][x])!='undefined'){ ids[1][x] = result['group2'][x].id; }
      if(ids[0][x]=='' || ids[1][x]==''){ all_has_user = false; break; }
    }
    if(all_has_user){ 
      return ids;
    }else{
      return null;
    }
  }

  const get_data = (arr, col) => { /* 檢查資料用 */
    let data=[];
    for (let gg = 0; gg < arr.length; gg++) {
      const aa = arr[gg];
      data.push(aa[col]);
    }
    return data;
  }

  defineExpose({
    toggle_modal, /*讓外部可控制是否開啟視窗*/
    get_recommend_users, /* 讓外部可取得建議比賽組合 */
  });
</script>

<template> 
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  
  <!-- 智慧排場參數設定 -->
  <modal :show="modal.show" :click_bg_close="true" @close="modal.show=false">
    <template #header>
      <h3 class="font-bold text-xl">智慧排場參數設定</h3>
    </template>
    <template #body>
      <div class="mb-2">
        總等級容許差異：<input type="number" class="form-input px-1 py-1 rounded w-full" ref="input_diff_level_sum" v-model="modal.data.diff_level_sum" min="0"/>
        <span class="text-red-500">兩組人員等級總和的差異必須小於此設定值</span>
      </div>
      <div class="mb-2">
        個別等級容許差異：<input type="number" class="form-input px-1 py-1 rounded w-full" ref="input_diff_level_divi" v-model="modal.data.diff_level_divi" min="0"/>
        <span class="text-red-500">所有球員兩兩相比，等級差異必須小於此設定值</span>
      </div>
      <div class="mb-2">
        女性減益等級：<input type="number" class="form-input px-1 py-1 rounded w-full" ref="input_woman_level_deduct" v-model="modal.data.woman_level_deduct" min="0"/>
        <span class="text-red-500">計算女性等級時額外扣除的等級數(例：若5級女性強度只等於4級男性，此值請設為1)</span>
      </div>
      <div class="mb-2">
        免除女性減益之等級：<input type="number" class="form-input px-1 py-1 rounded w-full" ref="input_no_deduct_level" v-model="modal.data.no_deduct_level" min="0"/>
        <span class="text-red-500">當女性等級大於等於此設定值時，計算等級時就不會額外扣除女性減益等級</span>
      </div>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'"
              @click="save">
          儲存設定
      </button>
    </template>
  </modal>
</template>

<style scoped></style>