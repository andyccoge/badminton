<script setup>
  import { ref, reactive, provide, readonly, computed } from 'vue';
  import { useToast } from "vue-toastification";
  import Nav from './components/Nav.vue';
  import Leftmenu from './components/Leftmenu.vue';
  import Bottommenu from './components/Bottommenu.vue';
  import Modal from './components/Modal.vue';
  import Court from './components/Court.vue';

  const toast = useToast();

  // 主頁場地-------------------------------------------------------------------------
  let court_empty_user = () => { return [[0,0],[0,0]]; }
  /* time:比賽時間秒數、timer：計時函數回傳值、type：1.比賽,0.預備 */
  const court_empty = {id:null, name:'', time:0, timer:null, type:0, game_points:[0,0], users:court_empty_user()};
  let court_empty_keys = Object.keys(court_empty);
  let courts = reactive([
    {id:0, name:'場地一', time:0, timer:null, type:1, game_points:[0,0], users:[[0,2],[3,4]]},
    {id:1, name:'場地二', time:0, timer:null, type:1, game_points:[0,0], users:[[0,0],[0,0]]},
    {id:2, name:'場地三', time:0, timer:null, type:1, game_points:[0,0], users:[[0,0],[0,0]]},
    {id:3, name:'場地四', time:0, timer:null, type:1, game_points:[0,0], users:[[5,0],[7,0]]},
    {id:4, name:'預備1', time:0, timer:null, type:0, game_points:[0,0], users:[[5,0],[7,0]]},
    {id:5, name:'預備2', time:0, timer:null, type:0, game_points:[0,0], users:[[0,0],[0,0]]},
  ]);  
  const court_name = ref(null);
  let courtModal = reactive({
    show: false, index: -1, name: "", type:0,
  });
  let pointModal = reactive({
    show: false, repeat_index: -1, finish_index: -1,
  });
  const courtModal_add = (court_type) => {
    reset_courtModal(court_type); 
    
    if(court_type==0){ /* 預備場地 */
      courtModal.name = '預備';
      add_court();
    }else{ /* 正式場地 */
      courtModal.show = true;
      setTimeout(()=>{ court_name.value.focus() }, 100);
    }
  }
  const add_court = () => {
    if(!courtModal.name){
      toast.warning("請輸入場地名稱");
      return;
    }
    if(courtModal.index==-1){
      let new_data = {};
      court_empty_keys.forEach(key => { new_data[key] = court_empty[key] });
      new_data.name = courtModal.name;
      new_data.type = courtModal.type;
      courts.push(new_data);
    }else{
      courts[courtModal.index].name = courtModal.name;
    }
    courtModal.show = false;
    reset_courtModal(); 
  }
  const reset_courtModal = (court_type=0) => {
    courtModal.index = -1;
    courtModal.name = "";
    courtModal.type = court_type;
  }
  const court_eidt = (court_index) => {
    courtModal.show = true;
    courtModal.index = court_index;
    courtModal.name = courts[court_index].name;
    courtModal.type = courts[court_index].type;
    setTimeout(()=>{ court_name.value.focus() }, 100);
  }
  const court_delete = (court_index) => {
    if (court_index < 0 && court_index > courts.length) { return; }
    if(!confirm('確定刪除場地？')){ return; }
    let court = courts[court_index];
    courts.splice(court_index, 1);
    court.users.forEach(users => {
      users.forEach(user_id => {
        user_set_status(user_id, 0, 'user_id');
      })
    });
  }
  const court_start = (court_index) => {
    if(check_court_empty(court_index)){
      toast.warning("此場地尚未安排人員");
      return;
    }
    if(courts[court_index].timer){
      toast.warning("此場地已開始比賽");
    }else{
      courts[court_index].timer = setInterval(function(){
        courts[court_index].time += 1;
      }, 1000);
    }
  }
  const court_stop = (court_index, need_notify=true) => {
    if(courts[court_index].time<=0){
      if(need_notify){
        toast.warning("此場地尚未開始比賽");
      }
      return false;
    }else{
      if(courts[court_index].timer){
        clearInterval(courts[court_index].timer);
        courts[court_index].timer = null;
      }
      return true;
    }
  }
  const model_point_input = ref(null);
  const court_repeat = (court_index) => {
    let result = court_stop(court_index);
    if(!result){ return; }

    if(check_court_empty(court_index)){
      toast.warning("無比賽人員，無法再來一場");return;
    }      
    pointModal.repeat_index = court_index;
    pointModal.finish_index = court_index;
    pointModal.show = true;
    setTimeout(()=>{ model_point_input.value.focus() }, 100);
  }
  const court_next = (court_index) => {
    let result = court_stop(court_index);
    if(!result){ return; }

    pointModal.repeat_index = -1;
    pointModal.finish_index = court_index;
    if(check_court_empty(court_index)){
      court_complete();
    }else{
      pointModal.show = true;
      setTimeout(()=>{ model_point_input.value.focus() }, 100);
    }
  }
  const court_complete = () =>{    
    /* TODO：儲存比賽紀錄 */

    /* 設定剛比完賽的人員 */
    played_user_ids.value = [];
    courts[pointModal.finish_index].users.forEach((group)=>{
      group.forEach((user_id) => { played_user_ids.value.push(user_id); });
    });
    
    let has_next_game = null;
    if(pointModal.repeat_index!=-1){ /* 再一場 */
      has_next_game = true;
    }
    else{ /* 換下一場 */
      has_next_game = court_change(pointModal.finish_index); /* 檢查是否有下一場比賽 */
    }
      
    change_user_calculate(pointModal.finish_index); /* 更新人員比賽統計 */
    if(has_next_game){
      start_new_game(pointModal.finish_index);
    }else{
      court_reset(pointModal.finish_index, true);
    }
    if(check_court_empty(pointModal.finish_index)){     
        toast.warning("目前已無預備人員，或預備人員正在場上");
    }
    pointModal.show = false;
  }
  const court_change = (court_index) => {  
    /* 設定場上人員下場 */
    let ori = copy_court(courts[court_index]);
    courts[court_index].users = court_empty_user();
    ori.users.forEach((group, group_index)=>{
      group.forEach((user_id,user_index) => {
        user_set_status(user_id, 0, 'user_id');
      });
    });

    let has_next_game = false;
    for (let x = 0; x < courts.length; x++) {
      if(courts[x].type==0){
        if(check_court_empty(x)){ continue; }
        let has_uer_on_court = false;
        for (let y = 0; y < courts[x].users.length; y++) {
          for (let z = 0; z < courts[x].users.length; z++) {
            let check_user_id = courts[x].users[y][z];
            if(check_on_court(check_user_id) && check_user_id!='0'){
              has_uer_on_court = true;
              break;
            }
          }
        }
        if(has_uer_on_court){ continue; }
        has_next_game = true;

        /* 設定下組員上場 */
        let next = copy_court(courts[x]);
        next.users.forEach((group, group_index)=>{
          group.forEach((user_id, user_index) => {
            courts[court_index].users[group_index][user_index] = user_id;
            user_set_status(user_id, 1, 'user_id');
          });
        });
        next.users = court_empty_user();

        courts.splice(x, 1);
        courts.push(next);
        break;
      }
    }

    return has_next_game;
  }
  /* 只在人員更新後才使用 */
  const change_user_calculate = (court_index) => {
    /* 調整人員比賽統計 */
    users.forEach((user, user_index) => {
      if(played_user_ids.value.indexOf(user.id)!=-1){ /* 如果是剛比完賽的人 */
        users[user_index].wait = 0;   /* 等待歸零 */
        users[user_index].played += 1;/* 完賽+1 */
      }
      else if(!check_on_court(user.id) && played_user_ids.value.indexOf(user.id)==-1){ /* 不在場上 且 不是剛比完賽的人 */
        users[user_index].wait += 1; /* 等待+1 */
      }
    });

    played_user_ids.value = []; /* 清除剛比完賽的人員 */
  }
  const start_new_game = (court_index) => {
    if(check_court_empty(court_index)){
      toast.warning("無比賽人員，無法開始");return;
    }
    court_reset(court_index, false);                /* 重置場地(不重置人員) */
    court_start(court_index);                       /* 開始計時 */
  }

  const check_court_empty = (court_index) => {
    let court_is_empty = true;
    for (let i = 0; i < courts[court_index].users.length; i++) {
      for (let x = 0; x < courts[court_index].users[i].length; x++) {
        if(courts[court_index].users[i][x] != 0){ 
          court_is_empty = false;break;
        }
      }
    }
    return court_is_empty;
  }
  const copy_court = (target_court) => {
    let copy = {};
    court_empty_keys.forEach(key => { copy[key] = target_court[key] });
    target_court.users.forEach((group, group_index)=>{ copy.users[group_index] = [...group] });
    return copy;
  }
  const court_reset = (court_index, reset_user=false) => {
    courts[court_index].time = court_empty.time;    /* 重置時間 */
    courts[court_index].points = court_empty.points;/* 重置比數 */
    clearInterval(courts[court_index].timer);       /* 清除計時 */
    courts[court_index].timer = court_empty.timer;  /* 重置計時器 */
    if(reset_user){
      courts[court_index].users = court_empty_user()/* 重設人員 */
    }
  }
  provide('courts', readonly(courts));
  provide('courtModal', readonly(courtModal));
  provide('court_eidt', court_eidt);
  provide('court_delete', court_delete);
  provide('court_start', court_start);
  provide('court_stop', court_stop);
  provide('court_repeat', court_repeat);
  provide('court_next', court_next);

  // 下方人員面板-------------------------------------------------------------------------
  let menu_open_bottom = ref(false);
  provide('menu_open_bottom', menu_open_bottom);
  
  let grouping_users_mode = ref(false) 
  const grouping_users_toggle = (status=0) => {
    if(grouping_users_mode.value || status==-1){
      grouping_users_mode.value = false;
      toast.info("群組人員模式已關閉");
      return;
    }
    if(!grouping_users_mode.value){
      grouping_users_mode.value = true;
      menu_open_bottom.value = true;
      toast.info("開啟群組人員模式");
    }
  }
  provide('grouping_users_mode', grouping_users_mode);
  provide('grouping_users_toggle', grouping_users_toggle);

  /* level：等級、played：已比場數、wait：等候場數、status:狀態0.閒置 1.場上 */
  const user_empty = {id:null, name:'', nick:'', gender:"", level:0, phone:'', email:'', played:0, wait:0, status:0};
  let userModal_keys = Object.keys(user_empty);
  let userModal = reactive({ 
    show:false, index:-1, 
    user:{id:0, name:'', nick:'', gender:"", level:0, phone:'', email:'', played:0, wait:0, status:0}
  });
  const userModal_user_name = ref(null);
  const userModal_user_level = ref(null);
  const userModal_open = (user_index=-1) => {
    // menu_open_bottom.value = true;
    userModal.show = true;
    userModal.index = user_index;
    setTimeout(()=>{ userModal_user_name.value.focus() }, 100);
    if(user_index==-1){
      userModal_keys.forEach(key => { userModal.user[key] = user_empty[key] });
    }else{
      userModal_keys.forEach(key => { userModal.user[key] = users[user_index][key] });
    }
  }
  const userModal_open_id = (user_id=-1) => {
    for (let index = 0; index < users.length; index++) {
      if(users[index].id==user_id){
        userModal_open(index);
        break;
      }
    }
  }
  provide('userModal_open', userModal_open);
  provide('userModal_open_id', userModal_open_id);
  
  const user_save = () => {
    if(!userModal.user.name){ toast.warning("請輸入姓名");return; }
    if(userModal.index==-1){
      let new_user = {};
      userModal_keys.forEach(key => { new_user[key] = userModal.user[key] });
      users.push(new_user)
      userModal_keys.forEach(key => { userModal.user[key] = user_empty[key] });
    }
    else{
      userModal_keys.forEach(key => { users[userModal.index][key] = userModal.user[key] });
    }

    /* TODO：新增/編輯人員資料 */
    let new_user_id = users.length>=2 ? users[users.length-2].id + 1 : 0;
    if(userModal.index==-1){
      users[users.length-1].id = new_user_id;
    }

    toast.success("資料已儲存");
  }

  let users = reactive([
    {id:1, name:'人員1', nick:'人1', gender:"女", level:2, phone:'', email:'', played:0, wait:0, status:0},
    {id:2, name:'人員2', nick:'', gender:"男", level:5, phone:'', email:'', played:0, wait:0, status:1},
    {id:3, name:'人員3', nick:'人3', gender:"男", level:3, phone:'', email:'', played:0, wait:0, status:1},
    {id:4, name:'人員4', nick:'人4', gender:"女", level:1, phone:'', email:'', played:0, wait:0, status:1},
    {id:5, name:'人員5', nick:'人5', gender:"女", level:2, phone:'', email:'', played:0, wait:0, status:1},
    {id:6, name:'人員6', nick:'人6', gender:"男", level:2, phone:'', email:'', played:0, wait:0, status:0},
    {id:7, name:'人員7', nick:'人7', gender:"男", level:2, phone:'', email:'', played:0, wait:0, status:1},
    {id:8, name:'人員8', nick:'人8', gender:"女", level:3, phone:'', email:'', played:0, wait:0, status:0},
    {id:9, name:'人員9', nick:'人9', gender:"女", level:3, phone:'', email:'', played:0, wait:0, status:0},
    {id:10, name:'人員10', nick:'人10', gender:"女", level:3, phone:'', email:'', played:0, wait:0, status:0},
  ]);
  let users_by_teams = reactive([[...users.map((user=>{return user.id}))]]);
  let team_select_uesr_ids = ref([]);
  let played_user_ids = ref([]);
  const users_rest = computed(()=> { return users.filter(user => user.status==0)});
  provide('users', readonly(users));
  provide('users_by_teams', readonly(users_by_teams));
  provide('team_select_uesr_ids', readonly(team_select_uesr_ids));
  provide('users_rest', readonly(users_rest));
  const get_user_name = (user_id) => {
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      if(element.id==user_id){ return element.nick ? element.nick : element.name; };
    }
  }
  provide('get_user_name', get_user_name);
  const court_delete_user = (court_index, group, index) => {
    let user_id = courts[court_index].users[group][index];
    courts[court_index].users[group][index] = "0";
    user_set_status(user_id, 0, 'user_id');
  }
  provide('court_delete_user', court_delete_user);
  const user_set_status = (key=-1, status, search_type='user_id') => {
    if(key < 0 || key===''){ return; }

    let user_id = "";
    let user_index = "";
    if(search_type=='user_id'){
      users.forEach((user,index) => {
        if(user.id==key){
          user_id = key
          user_index = index;
        };
      });
    }
    else if(search_type=='user_index'){
      if(key >= users.length){ return; }
      user_id = users[key].id;
      user_index = key;
    }
    if(user_index===""){ return; }
    if(status==1){
      if(check_on_court(user_id)){
        users[user_index].status = status;
      }
    }
    else if(status==0){
      if(!check_on_court(user_id)){
        users[user_index].status = status;
      }
    }
  }

  let chage_user = reactive({court_index: -1, user_group: 0, user_index: 0});
  const court_chage_user = (court_index, user_group, user_index) => {
    chage_user.court_index = court_index;
    chage_user.user_group = user_group;
    chage_user.user_index = user_index;
    menu_open_bottom.value = true;
  }
  const court_chage_user_reset = () => {
    chage_user.court_index = -1;
    chage_user.user_group = 0;
    chage_user.user_index = 0;
  }
  const select_user = (user_index) => {
    if(grouping_users_mode.value){ /* 啟用群組模式下 */
      let select_user_index = team_select_uesr_ids.value.indexOf(users[user_index].id);
      if(select_user_index==-1){
        team_select_uesr_ids.value.push(users[user_index].id);
      }else{
        team_select_uesr_ids.value.splice(select_user_index, 1);
      }
    }else{
      if(chage_user.court_index==-1){ 
        toggle_menu_open_left(user_index);
        set_user_view(user_index);
      }
      else{
        let ori_user = courts[chage_user.court_index].users[chage_user.user_group][chage_user.user_index];
        courts[chage_user.court_index].users[chage_user.user_group][chage_user.user_index] = users[user_index].id;
        user_set_status(ori_user, 0, 'user_id');
        user_set_status(user_index, 1, 'user_index');
        menu_open_bottom.value = false;
      }
    }
  }
  const grouping_users = () => {
    console.log(users_by_teams);
    let group = [...team_select_uesr_ids.value];
    if(group.length==0){ toast.warning('尚未選擇群組人員');return; }

    let copy = [];
    for (let x = 0; x < users_by_teams.length; x++) {
      copy.push([...users_by_teams[x]]);
    }
    for (let x = 0; x < copy.length; x++) {
      for (let y = 0; y < copy[x].length; y++) {
        if(group.indexOf(copy[x][y])!=-1){
          let index = users_by_teams[x].indexOf(copy[x][y]);
          users_by_teams[x].splice(index, 1);
        }
      }
    }
    users_by_teams.push(group);
    
    copy = [...users_by_teams];
    for (let x = 0; x < copy.length; x++) {
      if(x!=0){
        if(copy[x].length==1){
          users_by_teams[0].push(copy[x][0]);
        }
        if(copy[x].length<=1){  
          let index = users_by_teams.indexOf(copy[x]);
          users_by_teams.splice(index, 1);
        }
      }
    }

    team_select_uesr_ids.value = [];
  }
  const set_user_view  = (user_index) => {
    user_view_index.value = user_index;
  }
  const check_on_court = (user_id, court_type=1) => {
    let on_court = false;
    for (let i = 0; i < courts.length; i++) {
      if(courts[i].type==court_type){ /* 屬於要找的場地類型 */
        for (let x = 0; x < courts[i].users[0].length; x++) {
          if(courts[i].users[0][x] == user_id){ on_court=true;break; }
        }
        for (let x = 0; x < courts[i].users[1].length; x++) {
          if(courts[i].users[1][x] == user_id){ on_court=true;break; }
        }
      }
    }
    return on_court;
  }
  provide('chage_user', chage_user);
  provide('court_chage_user', court_chage_user);
  provide('court_chage_user_reset', court_chage_user_reset);
  provide('select_user', select_user);
  provide('grouping_users', grouping_users);
  provide('check_on_court', check_on_court);

  // 左側人員詳細料面板-------------------------------------------------------------------------
  let menu_open_left = ref(false);
  const toggle_menu_open_left = (user_index=-1)=>{
    if(user_index==-1){
      if(menu_open_left.value){
          menu_open_left.value = false;
      }else{
          menu_open_left.value = true;
      }
    }else{
      menu_open_left.value = true;
      set_user_view(user_index);
    }
  }
  const toggle_menu_open_left_id = (user_id=-1) => {
    for (let index = 0; index < users.length; index++) {
      if(users[index].id==user_id){
        toggle_menu_open_left(index);
        break;
      }
    }
  }
  provide('menu_open_left', readonly(menu_open_left));
  provide('toggle_menu_open_left', toggle_menu_open_left);
  provide('toggle_menu_open_left_id', toggle_menu_open_left_id);
  
  let user_view_index = ref(-1);
  provide('user_view_index', user_view_index);
  const user_delete = (user_index) => {
    if (user_index < 0 && user_index > users.length) { return; }
    if(!confirm('確定刪除此人？')){ return; }
    let user = users[user_index];
    courts.forEach((court, court_index) => {
      court.users.forEach((group, group_index) => {
        group.forEach((user_id, court_user_index) => {
          if(user_id==user.id){ courts[court_index].users[group_index][court_user_index] = '0'; }
        })
      })
    });
    set_user_view(-1);
    menu_open_left.value = false;
    users.splice(user_index, 1); 
  }
  provide('user_delete', user_delete);


  /*-- PWA功能 --*/
    /*加入主畫面-------------------------------*/
    const modal_open_add_home = ref(null);
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        // Update UI to notify the user they can add to home screen
        modal_open_add_home.value = e;
      });
    }
    const do_add_home = () => {
      if(!modal_open_add_home.value){ return; }
      // Show the prompt
      modal_open_add_home.value.prompt();
      // Wait for the user to respond to the prompt
      modal_open_add_home.value.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        modal_open_add_home.value = null;
      });
    }
</script>
<script>
  let check_renew = true;
  window.onbeforeunload=function(e){
    if(check_renew){
      var e=window.event||e;
      e.returnValue=("確定離開當前頁面嗎？");
    }
  }
</script>

<template>
  <!-- 新增/編輯場地 -->
  <modal :show="courtModal.show" :click_bg_close="true" 
         @close="courtModal.show = false">
    <template #header>
      <h3 class="font-bold text-xl" v-if="courtModal.index==-1">新增場地</h3>
      <h3 class="font-bold text-xl" v-if="courtModal.index!=-1">編輯場地</h3>
    </template>
    <template #body>
      <p>請輸入場定名稱：</p>
      <input type="text" class="form-input px-1 py-1 rounded w-full" 
              ref="court_name" v-model="courtModal.name" @keypress.enter="add_court"/>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="[courtModal.type==1 ? 'bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500' :
                                            'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'
                      ]"
              @click="add_court">
        確認儲存
      </button>
    </template>
  </modal>
  <!-- 輸入比數 -->
  <modal :show="pointModal.show" :click_bg_close="true" 
         @close="pointModal.show = false; court_start(pointModal.finish_index);">
    <template #header>
      <h3 class="font-bold text-xl">輸入比數</h3>
    </template>
    <template #body>
      <div class="flex">
        <div class="text-center">
          <span v-text="get_user_name(courts[pointModal.finish_index].users[0][0])"></span>
          <span v-if="courts[pointModal.finish_index].users[0][0]!=0 && courts[pointModal.finish_index].users[0][1]!=0">、</span>
          <span v-text="get_user_name(courts[pointModal.finish_index].users[0][1])"></span>
          <input type="number" step="1" min="0" class="form-input px-1 py-1 rounded w-full"
                 @keyup.enter="court_complete"
                 v-model="courts[pointModal.finish_index].game_points[0]" ref="model_point_input"/>
        </div>
        <div class="p-1"><br>：</div>
        <div class="text-center">
          <span v-text="get_user_name(courts[pointModal.finish_index].users[1][0])"></span>
          <span v-if="courts[pointModal.finish_index].users[1][0]!=0 && courts[pointModal.finish_index].users[1][1]!=0">、</span>
          <span v-text="get_user_name(courts[pointModal.finish_index].users[1][1])"></span>
          <input type="number" step="1" min="0" class="form-input px-1 py-1 rounded w-full"
                 @keyup.enter="court_complete"
                 v-model="courts[pointModal.finish_index].game_points[1]"/>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500'"
              @click="court_complete">
        完成比賽
      </button>
    </template>
  </modal>
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
  <!-- 加入主頁面 -->
  <modal :show="modal_open_add_home!=null" :click_bg_close="true" @close="modal_open_add_home=null;">
    <template #header>
      <h3 class="font-bold text-xl">加入主畫面</h3>
    </template>
    <template #body>
      <p>在手機主畫面建立捷徑，讓管理羽球場地更加輕鬆容易~</p>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'"
              @click="do_add_home">
        建立
      </button>
    </template>
  </modal>

  <!-- <Nav></Nav> -->
  <Leftmenu></Leftmenu>

  <main>
    <div class="bg-green-200 pb-6">
      <div class="grid gap-0 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 sm:px-4 px-0">
        <template v-for="(court, court_index) in courts">
          <Court v-if="court.type==1"
                :court="court"
                :court_index="court_index"
          ></Court>
        </template>
      </div>
      <div class="container mx-auto mt-4">
        <button id="show-modal" @click="courtModal_add(1)"
                class="w-full font-bold py-2 px-4 border-b-4 rounded
                    bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500">
          新增比賽場地
        </button>
      </div>
    </div>
    <hr class="">

    <div class="bg-yellow-200 pt-1 pb-6 relative">
      <span class="absolute pl-8 pt-3 animate-bounce">
        <svg class="h-8 w-8 text-yellow-400"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <line x1="12" y1="5" x2="12" y2="19" />  <polyline points="19 12 12 19 5 12" /></svg>
      </span>
      <div class="grid gap-0 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 sm:px-4 px-0">
        <template v-for="(court, court_index) in courts">
          <Court v-if="court.type==0"
              :court="court"
              :court_index="court_index"
          ></Court>
        </template>
      </div>
      <div class="container mx-auto mt-4">
        <button id="show-modal" @click="courtModal_add(0)"
                class="w-full font-bold py-2 px-4 border-b-4 rounded
                    bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500">
          新增預備場地
        </button>
      </div>
    </div>
  </main>

  <Bottommenu></Bottommenu>
</template>

<style scoped>
</style>
