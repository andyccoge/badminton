<script setup>
  import { ref, reactive, inject, onMounted } from 'vue';
  import * as firebase from '../firebase.js';
  import { useToast } from "vue-toastification";
  import BodyBlock from '../components/BodyBlock.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');

  let body_block_show = ref(false);
  let body_block_show_long = ref(false);
  const set_body_block_show_long = (status) => {
    body_block_show_long.value = status
  }

  let body_block_show_top = ref(false);
  let body_block_show_long_top = ref(false);
  const set_body_block_show_top = (status) => {
    body_block_show_top.value = status
  }

  // const emit = defineEmits(['sign_in_success']);

  const db_add_data =  async(table, data, repeat_cond=[]) => {
    body_block_show.value = true;
    let repeat_data = [];
    if(repeat_cond.length>0){
      try{
        repeat_data = await firebase.get_db_data(table, repeat_cond);
      } catch (error) {
        console.log(error)
        repeat_data = null;
      }
    }
    if(repeat_data===null){
      toast.error("資料讀取(依篩選條件)發生問題");
      data = null;
    }else{
      if(repeat_data.length>0){
        await swal({
          title: '發現重複資料，確定新增？',
          text: "",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '確定',
          confirmButtonColor: '#3085d6',
          cancelButtonText: '取消',
          cancelButtonColor: '#d33',
        }).then(async(result) => {
          if (result.isConfirmed) {
            let data_id = await firebase.add_data(table, data);
            data.id =data_id;
          }else{
            data = null;
          }
        });
      }else{
        try {
          let data_id = await firebase.add_data(table, data);
          data.id = data_id;
        } catch (error) {
          console.log(error);
          data = null;
        }
      }
    }
    body_block_show.value = false;
    return data;
  }
  const db_set_data = async(table, data) => {
    body_block_show.value = true;
    let ids = []
    try {
      ids = await firebase.set_data(table, data);
    } catch (error) {
      console.log(error);
      toast.error("資料批次寫入發生問題");
    }
    body_block_show.value = false;
    return ids;
  }
  const db_get_data = async(table, cond=[{'orderBy':["create_time", "desc"]}]) => {
    body_block_show.value = true;
    let data = [];
    try {
      data = await firebase.get_db_data(table, cond);
    } catch (error) {
      console.log(error);
      toast.error("資料讀取發生問題");
    }
    // console.log(data)
    body_block_show.value = false;
    return data;
  }
  const db_update_data = async(table, id, data) => {
    let result = true;
    body_block_show.value = true;
    try {
      await firebase.update_data(table, id, data);
    } catch (error) {
      console.log(error);
      toast.error("資料儲存發生問題");
      result = false;
    }
    body_block_show.value = false;
    return result;
  }      
  const db_delete_data = async(table, id) => {
    let result = true;
    body_block_show.value = true;
    try {
      await firebase.delete_data(table, id);
    } catch (error) {
      console.log(error);
      toast.error("資料刪除發生問題");
      result = false;
    }
    body_block_show.value = false;
    return result;
  }

  const add_game_date_users = async(game_date_id, user_id) => {
    let new_data = {game_date_id:game_date_id, user_id:user_id};
    let repeat = await db_get_data('game_date_users', [
      ['game_date_id', '==', game_date_id],
      ['user_id', '==', user_id]
    ]);
    if(repeat.length==0){
      const result = await db_add_data('game_date_users', new_data, [
        ['game_date_id', '==', game_date_id],
        ['user_id', '==', user_id]
      ]);
      return result; /* 不存在，建立 */
    }else{
      return null; /* 已存在，不建立 */
    }
  }
  const get_game_date_users = async(game_date_id) => {
    let game_date_user_data = await db_get_data('game_date_users', [['game_date_id','==', game_date_id], {'orderBy':['create_time', 'asc']}]);
    for (let i = 0; i < game_date_user_data.length; i++) {
      let user = await db_get_data('users', [['id','==', game_date_user_data[i].user_id]]);
      user = user.length>0 ? user[0] : {};
      game_date_user_data[i] = functions.merge_user_and_date_user_data(user, game_date_user_data[i]);
    }
    return game_date_user_data;
  }
  const copy_date= async(new_id, copy_target_id) => {
    let date_users = await db_get_data('game_date_users', [['game_date_id','==', copy_target_id], {'orderBy':['create_time', 'asc']}]);
    // console.log(date_users);
    date_users.forEach((value, key) => { 
      date_users[key].id = null;
      date_users[key].game_date_id = new_id;
      date_users[key].paid = 0;
      date_users[key].played = 0;
      date_users[key].status = 0;
      date_users[key].wait = 0;
    });
    await db_set_data('game_date_users', date_users);
    
    let date_courts = await db_get_data('game_date_courts', [['game_date_id', '==', copy_target_id], {'orderBy':['create_time', 'asc']}]);
    // console.log(date_courts);
    date_courts.forEach((value, key) => { 
      date_courts[key].id = null;
      date_courts[key].game_date_id = new_id;
    });
    await db_set_data('game_date_courts', date_courts);
  }

  defineExpose({
    set_body_block_show_long, /* 控制跨操作顯示黑屏 */
    set_body_block_show_top, /* 控制跨操作顯示黑屏(絕對頂) */
    
    db_add_data, /* 添加一筆資料(可檢查重複) */
    db_set_data, /* 批次添加資料(不檢查重複) */
    db_get_data, /* 依條件取得資料 */
    db_update_data, /* 更新資料 */
    db_delete_data, /* 刪除資料 */

    add_game_date_users, /* 添加add_game_date_users */
    get_game_date_users, /* 依date_id取得人員資料 */
    copy_date, /* 複製打球日的場地、人員資料 */
  })
</script>

<template>
  <BodyBlock :show="body_block_show || body_block_show_long"></BodyBlock>
  <BodyBlock :show="body_block_show_top || body_block_show_long_top" :zindex="99999"></BodyBlock>
</template>
