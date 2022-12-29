<script setup>
  import { ref, reactive, provide, readonly, computed, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalUserEditor from '../components/ModalUserEditor.vue';
  import Nav from '../components/Nav.vue';
  import Leftmenu from '../components/Leftmenu.vue';
  import Bottommenu from '../components/Bottommenu.vue';
  import Court from '../components/Court.vue';
  import CourtEditor from '../components/CourtEditor.vue';
  import ContestRecord from '../components/ContestRecord.vue';
  import ModalPoints from '../components/ModalPoints.vue';
  import * as functions from '../functions.js';
  import * as Icon from '@heroicons/vue/24/outline';
  import GoogleTextToSpeech from '../components/GoogleTextToSpeech.vue';
  const toast = useToast();
  const swal = inject('$swal');

  const refGoogleTextToSpeech = ref(null);
  const toggle_use_sound = () => {
    refGoogleTextToSpeech.value.toggle_use_sound();
  }
  const get_use_sound = () => {
    const use_sound = refGoogleTextToSpeech.value ? refGoogleTextToSpeech.value.use_sound : 'false';
    return use_sound;
  }
  provide('toggle_use_sound', toggle_use_sound);
  provide('get_use_sound', get_use_sound);

  let game_date_id = ref(functions.get_href_attr('date'));
  game_date_id.value = game_date_id.value ? game_date_id.value : "";
  provide('game_date_id', game_date_id);
  let game_date_data = ref({});

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
    refFirebase.value.set_body_block_show_long(true);

    /*取得打球日資料*/
    if(game_date_id.value==''){
      const game_date = await refFirebase.value.db_get_data('game_date', [{'orderBy':['date', 'desc']}]);
      if(game_date.length==0){
        swal({
          title: '無可用的打球日',
          text: "",
          icon: 'warning',
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: '離開',
        }).then(()=>{
          location.href = '/';
        })
      }else{
        game_date_id.value = game_date[0].id;
        game_date_data.value = game_date[0];
      }
    }
    else{
      const game_date = await refFirebase.value.db_get_data('game_date', [['id', '==', game_date_id.value]]);
      if(game_date.length==0){
        swal({
          title: '無此打球日',
          text: "",
          icon: 'warning',
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: '離開',
        }).then(()=>{
          location.href = '/';
        })
      }
      game_date_data.value = game_date[0];
    }

    /*取得比賽資料*/
    await refContestRecord.value.init_data();
    sync_contest_record();

    /* 取得場地資料 */
    await get_game_date_courts();

    /*取得人員資料*/
    await get_play_users();

    /*避免重整*/
    window.onbeforeunload=function(e){
      var e=window.event||e;
      e.returnValue=("確定離開當前頁面嗎？");
    }

    refFirebase.value.set_body_block_show_long(false);
  }
  const get_game_date_courts = async() => {
    for (let x = 0; x < courts.length; x++) {
      if(courts[x].timer){clearInterval(courts[x].timer);}
    }
    courts.splice(0, courts.length);
    let courts_data = await refFirebase.value.db_get_data('game_date_courts', [['game_date_id', '==', game_date_id.value], {'orderBy':['create_time', 'asc']}]);
    for (let x = 0; x < courts_data.length; x++) {
      courts.push(courts_data[x]);
    }
    // console.log(courts);
    refBottommenu.value.init_alert_wait();
  }
  const save_game_date_courts = async() => {
    refFirebase.value.set_body_block_show_long(true);
    for (let index = 0; index < courts.length; index++) {
      const element = courts[index];
      const result = await refFirebase.value.db_update_data('game_date_courts', element.id, element);
      if(result===false){
        refFirebase.value.set_body_block_show_long(false);
        return;
      }
    }
    refFirebase.value.set_body_block_show_long(false);
  }
  const get_play_users = async() => {
    users.splice(0, users.length);
    let user_data = await refFirebase.value.get_game_date_users(game_date_id.value);
    for (let i = 0; i < user_data.length; i++) {
      add_show_user(user_data[i]);
    }
    /* 更新人員狀態 */
    users.forEach((user, index) => {
      user_set_status(index, 1, 'user_index');
    });

    /* 更新完賽數 */
    set_users_played_num();

    /* 更新群組 */
    const copy_teams = JSON.parse(JSON.stringify(users_by_teams));
    users_by_teams.splice(0, users_by_teams.length);
    for (let x = 0; x < copy_teams.length; x++) {
      let in_group = [];
      for (let y = 0; y < users.length; y++) {
        if(copy_teams[x].indexOf(users[y].id)!=-1){
          in_group.push(users[y].id);
        }       
      }
      if(in_group.length>=2){
        users_by_teams.push(in_group);
      }
    }
  }
  const renew_users = async() => {
    refFirebase.value.set_body_block_show_long(true);
    await get_play_users();
    refFirebase.value.set_body_block_show_long(false);
  }
  const set_users_played_num = () => {
    users.forEach((item, y) => {
      users[y].played = 0;
    });
    for (let x = 0; x < contest_record.length; x++) {
      const game_users = contest_record[x].users;
      users.forEach((item, y) => {
        if(game_users[0].indexOf(item.id)!=-1){ users[y].played += 1; }
        if(game_users[1].indexOf(item.id)!=-1){ users[y].played += 1; }
      });
    }
  }
  const add_show_user = (data) => {
    data = {...data, ...user_play_data_empty};
    users.push(data);
  }
  const set_user_check_in = (indexs, num) => {
    refFirebase.value.set_body_block_show_top(true);
    indexs.forEach(async(index) => {
      users[index].check_in = num;
      await refFirebase.value.db_update_data('game_date_users', users[index].date_user_id, {'check_in': num});
    });
    refFirebase.value.set_body_block_show_top(false);
  }
  provide('set_user_check_in', set_user_check_in);

  // 主頁場地-------------------------------------------------------------------------
  let court_empty_user = () => { return [['',''],['','']]; }
  /* type：1.比賽,0.預備、time:比賽時間秒數、timer：計時函數回傳值 */
  const court_empty = {game_date_id:null, id:null, name: '', type:0, users:court_empty_user(), time:0, timer:null, game_points:[0,0]};
  let court_empty_keys = Object.keys(court_empty);
  
  let courts = reactive([]);
  const courts_pre = computed(()=> { return courts.filter(court => court.type==0)});
  provide('courts', readonly(courts));
  const refCourtEditor = ref(null);
  const court_eidt = (court_index) => {
    refCourtEditor.value.set_court_data(court_index);
  }
  provide('court_eidt', court_eidt);

  const change_court_data = (court_index, target) => {
    if(court_index==-1){
      target = init_court_data(target);
      courts.push(target);
    }
    else{
      const keys = Object.keys(target);
      keys.forEach(key => { courts[court_index][key] = target[key] });
    }
  }
  const init_court_data = (data) => {
    for (let i = 0; i < court_empty_keys.length; i++) {
      const key = court_empty_keys[i];
      if(typeof(data[key])=='undefined'){
        if(key=='users'){
          data[key] = court_empty_user();
        }else{
          data[key] = court_empty[key];
        }
      }
    }
    return data;
  }
  const courtModal_add = (num) => {
    refCourtEditor.value.courtModal_add(num);
  }

  const court_delete = async(court_index) => {
    if (court_index < 0 && court_index > courts.length) { return; }
    try {
      const result = await swal({
        title: '確定刪除場地？',
        text: "刪除後會自動更新場上人員狀態",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確定',
        confirmButtonColor: '#3085d6',
        cancelButtonText: '取消',
        cancelButtonColor: '#d33',
      });
      if (result.isConfirmed) {
        let court = courts[court_index];
        if(court.timer){clearInterval(court.timer);}
        courts.splice(court_index, 1);
        court.users.forEach(users => {
          users.forEach(user_id => {
            user_set_status(user_id, 0, 'user_id');
          })
        });
        await refFirebase.value.db_delete_data('game_date_courts', court.id);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  const court_start = (court_index) => {
    if(check_court_empty(court_index)){
      toast.warning("此場地尚未安排人員");
      return;
    }
    if(courts[court_index].timer){
      toast.warning("此場地已開始比賽");
    }else{
      const court_id =courts[court_index].id;
      courts[court_index].timer = setInterval((court_id)=>{
        for (let x = 0; x < courts.length; x++) {
          if(courts[x].id==court_id){
            courts[x].time += 1;
            break;
          }
        }
      }, 1000, court_id);
      refFirebase.value.db_update_data('game_date_courts', courts[court_index].id, {'users':courts[court_index].users});
    }
  }
  const court_stop = (court_index, need_notify=true) => {
    if(courts[court_index].time<=0 && !courts[court_index].timer){
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
  const court_repeat = (court_index) => {
    let result = court_stop(court_index);
    if(!result){ return; }

    if(check_court_empty(court_index)){
      toast.warning("無比賽人員，無法再來一場");return;
    }

    // refModalPoints.value.set_modal_data(court_index, court_index, courts[court_index]);
    court_complete(court_index, court_index);
  }
  const court_next = (court_index) => {
    if(!check_court_empty(court_index)){
      let result = court_stop(court_index);
      if(!result){ return; }
    }
    // refModalPoints.value.set_modal_data(court_index, -1, courts[court_index]);
    court_complete(court_index, -1);  
  }
  provide('court_delete', court_delete);
  provide('court_start', court_start);
  provide('court_stop', court_stop);
  provide('court_repeat', court_repeat);
  provide('court_next', court_next);

  const court_delete_user = (court_index, group, index) => {
    let user_id = courts[court_index].users[group][index];
    courts[court_index].users[group][index] = '';
    user_set_status(user_id, 0, 'user_id');
  }
  provide('court_delete_user', court_delete_user);
  /* 設定人員狀態(1.比賽 0.閒置，只在場上人員更新後使用，會檢查當前場地人員安排是否符合要求設定的人員狀態) */
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

  // 分數面板-------------------------------------------------------------------------
  const refModalPoints = ref(null);
  const update_court_points = (court_index, repeat_index, points) => {
    courts[court_index].game_points = points;
    court_complete(court_index, repeat_index);
  }

  let played_user_ids = ref([]);
  const court_complete = async(finish_index, repeat_index) =>{
    if(!check_court_empty(finish_index)){
      let contest_data = copy_court(courts[finish_index]);
      await refContestRecord.value.add_record(contest_data);
      sync_contest_record();
    }
  
    /* 設定剛比完賽的人員 */
    played_user_ids.value = [];
    courts[finish_index].users.forEach((group)=>{
      group.forEach((user_id) => { played_user_ids.value.push(user_id); });
    });
    
    let has_next_game = null;
    if(repeat_index!=-1){ /* 再一場 */
      has_next_game = true;
    }
    else{ /* 換下一場 */
      // console.log(finish_index);
      const finish_id = courts[finish_index].id;
      has_next_game = court_change(finish_index); /* 檢查是否有下一場比賽 */
      for (let x = 0; x < courts.length; x++) { /* 換場會更換array順序，故重抓結束場的index */
        if(finish_id==courts[x].id){
          finish_index = x;
          break;
        }
      }
      // console.log(finish_index);
    }
      
    change_user_calculate(finish_index); /* 更新人員比賽統計 */
    // alert(has_next_game);
    if(has_next_game){
      start_new_game(finish_index);
    }else{
      court_reset(finish_index, true);
    }
    if(check_court_empty(finish_index)){     
        toast.warning("目前已無預備人員，或預備人員正在場上");
    }else{
      toast.success(courts[finish_index].name + " 已換下一場");
      court_users_to_speech(finish_index);
    }
  }
  /* 給場地component呼叫的場地人員語音 */
  const court_users_to_speech = (court_index) => {
    if(check_court_empty(court_index)){
      toast.warning("此場地尚未安排人員");
      return;
    }
    refGoogleTextToSpeech.value.court_users_to_speech(users, courts[court_index]);
  }
  const court_change = (court_index) => {  
    /* 設定場上人員下場 */
    let ori = copy_court(courts[court_index]);
    courts[court_index].users = court_empty_user();
    ori.users.forEach((group, group_index)=>{
      group.forEach((user_id, user_index) => {
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
            if(check_on_court(check_user_id) && check_user_id!=''){
              has_uer_on_court = true;
              break;
            }
          }
        }
        // console.log(has_uer_on_court);
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
        if(courts[court_index].users[i][x] != ''){ 
          court_is_empty = false;break;
        }
      }
    }
    return court_is_empty;
  }
  provide('check_court_empty', check_court_empty);
  const copy_court = (target_court) => {
    let copy = JSON.parse(JSON.stringify(target_court));
    return copy;
  }
  const court_reset = (court_index, reset_user=false) => {
    courts[court_index].time = court_empty.time;                /* 重置時間 */
    courts[court_index].game_points = court_empty.game_points;  /* 重置比數 */
    clearInterval(courts[court_index].timer);                   /* 清除計時 */
    courts[court_index].timer = court_empty.timer;              /* 重置計時器 */
    if(reset_user){
      courts[court_index].users = court_empty_user()            /* 重設人員 */
    }
  }

  // 新增/編輯人員-------------------------------------------------------------------------
  const refModalUserEditor = ref(null);
  const userModal_open = (user_index=-1) => {
    let target_user = user_index!=-1 ? Object.assign({}, users[user_index]) : null;
    refModalUserEditor.value.set_user(user_index, target_user);
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

  const change_user_data = (user_index, user_data) => {
    if(user_index==-1){
      add_show_user(user_data);
    }else{
      let user_keys = Object.keys(user_data);
      user_keys.forEach(key => { users[user_index][key] = user_data[key] });
    }
  }

  // 人員資料-------------------------------------------------------------------------
  const user_play_data_empty = {played:0, wait:0, status:0};
  let users = reactive([]);
  let record_users_by_teams = localStorage.getItem('record_users_by_teams');
  let users_by_teams = record_users_by_teams ?  reactive(JSON.parse(record_users_by_teams)) : reactive([]);
  const users_rest = computed(()=> { return users.filter(user => user.status==0)});
  provide('users', readonly(users));
  provide('users_by_teams', readonly(users_by_teams));
  provide('users_rest', readonly(users_rest));

  // 下方人員面板-------------------------------------------------------------------------
  let refBottommenu = ref(null);
  let menu_open_bottom = ref(false);
  provide('menu_open_bottom', menu_open_bottom);
  let bottom_nav_more = ref(true);
  provide('bottom_nav_more', bottom_nav_more);
  
  let team_select_uesr_ids = ref([]);
  let grouping_users_mode = ref(false);
  const grouping_users_toggle = (status=0) => {
    if(grouping_users_mode.value || status==-1){
      if(grouping_users_mode.value){
        toast.info("群組人員模式已關閉");
      }
      grouping_users_mode.value = false;
      return;
    }
    if(!grouping_users_mode.value){
      if(!grouping_users_mode.value){
        toast.info("開啟群組人員模式");
      }
      grouping_users_mode.value = true;
      menu_open_bottom.value = true;
    }
  }
  provide('team_select_uesr_ids', readonly(team_select_uesr_ids));
  provide('grouping_users_mode', grouping_users_mode);
  provide('grouping_users_toggle', grouping_users_toggle);
  
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
    if(user_index==-1){ return; }
    if(grouping_users_mode.value){ /* 啟用群組模式下 */
      let select_user_index = team_select_uesr_ids.value.indexOf(users[user_index].id);
      if(select_user_index==-1){
        team_select_uesr_ids.value.push(users[user_index].id);
      }else{
        team_select_uesr_ids.value.splice(select_user_index, 1);
      }
    }else{
      if(chage_user.court_index==-1){  /* 開啟左側人員詳細資料 */
        toggle_menu_open_left(user_index);
      }
      else{
        let on_court = false;
        if(courts[chage_user.court_index].type==1){
          on_court = check_on_court(users[user_index].id);
        }else{
          on_court = check_on_court(users[user_index].id, 0, chage_user.court_index);
        }
        if(on_court){
          toast.warning('此人已在場上，無法選擇');
          return;
        }
        let ori_user = courts[chage_user.court_index].users[chage_user.user_group][chage_user.user_index];
        courts[chage_user.court_index].users[chage_user.user_group][chage_user.user_index] = users[user_index].id;
        user_set_status(ori_user, 0, 'user_id');
        user_set_status(user_index, 1, 'user_index');
        const ori_court_index = chage_user.court_index;
        chage_user.court_index = -1;
        // console.log(courts[ori_court_index]);
        for (let x = 0; x < courts[ori_court_index].users.length; x++) {
          const element = courts[ori_court_index].users[x];
          for (let y = 0; y < element.length; y++) {
            const element2 = element[y];
            if(element2=='' && chage_user.court_index==-1){
              chage_user.court_index = ori_court_index;
              chage_user.user_group = x;
              chage_user.user_index = y;
              break;
            }
          }
        }
        
        // menu_open_bottom.value = false;
      }
    }
  }
  const grouping_users = () => {
    let group = [...team_select_uesr_ids.value];
    if(group.length==0){ toast.warning('尚未選擇群組人員');return; }

    let copy = JSON.parse(JSON.stringify(users_by_teams));
    for (let x = 0; x < copy.length; x++) {
      for (let y = 0; y < copy[x].length; y++) {
        if(group.indexOf(copy[x][y])!=-1){
          let index = users_by_teams[x].indexOf(copy[x][y]);
          users_by_teams[x].splice(index, 1);
        }
      }
    }
    copy = JSON.parse(JSON.stringify(users_by_teams));
    users_by_teams.splice(0, users_by_teams.length);
    for (let x = 0; x < copy.length; x++) {
      if(copy[x].length>1){ users_by_teams.push(copy[x]); }
    }
    if(group.length>1){ users_by_teams.push(group); }

    localStorage.setItem('record_users_by_teams', JSON.stringify(users_by_teams));
    team_select_uesr_ids.value = [];
  }
  const check_on_court = (user_id, court_type=1, court_index=-1) => {
    let on_court = 0;
    for (let i = 0; i < courts.length; i++) {
      if(courts[i].type==court_type){ /*屬於要找的場地類型*/
        if(court_index==-1 || court_index==i){ /*不依場地看 或 是要檢查的場地*/
          for (let x = 0; x < courts[i].users[0].length; x++) {
            if(courts[i].users[0][x] == user_id){ on_court+=1; }
          }
          for (let x = 0; x < courts[i].users[1].length; x++) {
            if(courts[i].users[1][x] == user_id){ on_court+=1; }
          }
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

  // 上方選單-------------------------------------------------------------------------
  const refNav = ref(null);
  const auto_set_users = (court_index) => {
    const result = refNav.value.refModalAutoSetUserSetting.get_recommend_users(court_index, users, courts, contest_record);
    // console.log(result);
    if(result){
      courts[court_index].users = JSON.parse(JSON.stringify(result));
    }
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
  const user_delete = (user_index) => {
    if (user_index < 0 && user_index > users.length) { return; }
    swal({
      title: '確定刪除此人？',
      text: "刪除後相關比賽紀錄可能顯示會有問題",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      confirmButtonColor: '#3085d6',
      cancelButtonText: '取消',
      cancelButtonColor: '#d33',
    }).then(async(result) => {
      if (result.isConfirmed) {
        let user = users[user_index];
        courts.forEach((court, court_index) => {
          court.users.forEach((group, group_index) => {
            group.forEach((user_id, court_user_index) => {
              if(user_id==user.id){ courts[court_index].users[group_index][court_user_index] = ''; }
            })
          })
        });
        toggle_menu_open_left(-1);
        await refFirebase.value.db_delete_data('game_date_users', user.date_user_id);
        users.splice(user_index, 1);
      }
    });
  }

  // 比賽紀錄-------------------------------------------------------------------------
  let refContestRecord = ref(null);
  let modal_open_contest_record = ref(false);
  let contest_record = reactive([]);
  provide('modal_open_contest_record', modal_open_contest_record);
  provide('contest_record', readonly(contest_record));
  const sync_contest_record = () => {
    contest_record.splice(0, contest_record.length);
    const refContestRecord_data = refContestRecord.value.get_data();
    for (let x = 0; x < refContestRecord_data.contest_record.length; x++) {
      contest_record.push(refContestRecord_data.contest_record[x]);
    }
  }
</script>

<template>
  <GoogleTextToSpeech ref="refGoogleTextToSpeech"></GoogleTextToSpeech>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <ModalUserEditor @change_user_data="change_user_data" :users="users" ref="refModalUserEditor"></ModalUserEditor>
  <CourtEditor @change_court_data="change_court_data" ref="refCourtEditor"></CourtEditor>
  <ModalPoints @court_start="court_start" @update_court_points="update_court_points"  ref="refModalPoints"></ModalPoints>
  <ContestRecord ref="refContestRecord" @sync_contest_record="sync_contest_record" @set_users_played_num="set_users_played_num"></ContestRecord>
  <Nav ref="refNav" :users="users"></Nav>
  <Leftmenu :users="users" ref="refLeftmenu" 
            @change_user_data="change_user_data" :need_user_date_info="true"
            @userModal_open="userModal_open" :need_user_edit="true"
            @user_delete="user_delete" :need_user_delete="true">
  </Leftmenu>

  <main>
    <div class="bg-yellow-200 pb-6 relative">
      <h2 class="text-center font-bold text-xl flex justify-center flex-wrap">
        <button class="mr-3" @click="save_game_date_courts">
          <Icon.CloudArrowUpIcon class="h-5 w-5 text-black"></Icon.CloudArrowUpIcon>
        </button>
        <span v-text="functions.stamp_to_time(game_date_data.date)"></span>
        <span v-text="game_date_data.location"></span>
        <button class="ml-3" @click="get_game_date_courts">
          <Icon.CloudArrowDownIcon class="h-5 w-5 text-black"></Icon.CloudArrowDownIcon>
        </button>
      </h2>
      <div class="grid gap-0 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 sm:px-4 px-0">
        <template v-for="(court, court_index) in courts">
          <Court v-if="court.type==1"
                :court="court"
                :court_index="court_index"
                @court_users_to_speech="court_users_to_speech"
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
      <span class="absolute pl-3 pt-3 animate-bounce" v-if="courts_pre.length>0">
        <Icon.ArrowDownIcon class="h-8 w-8 text-yellow-400"></Icon.ArrowDownIcon>
      </span>
      <div class="grid gap-0 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 sm:px-4 px-0">
        <template v-for="(court, court_index) in courts">
          <Court v-if="court.type==0"
              :court="court"
              :court_index="court_index"
              @auto_set_users="auto_set_users"
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

  <Bottommenu ref="refBottommenu" @renew_users="renew_users"></Bottommenu>
</template>

<style scoped>
</style>
