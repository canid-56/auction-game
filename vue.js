var debug=true;
var debug=false;
var env="standalone";
// var env="gas";

const minNumPlayer = 4;
const maxNumPlayer = 10;
const maxToken = 20;
const defaultState = {
    numPlayer:minNumPlayer,
    playerList:[],
    auctionItems:[],
    currentState:0,
    auctionAssginment:[],
    auctionLog:[],
    debug:debug
};

/**
 * 一様分布に従う乱数を生成する関数
 * @param {number} min - 下限
 * @param {float} max - 上限
 * @param {number} flooring - 整数丸めを行うかどうか
 * @returns {number} 生成された乱数
 */
function randomRange(min=0, max=1,flooring=true){
    res = Math.random() * (max-min) + min
    if (flooring) {
        res = Math.floor(res)        
    }
    return res
}

/**
 * ランダムな数値区間を生成する関数
 * @param {number} min - 下限
 * @param {number} max - 上限
 * @param {number} step - 解像度
 * @param {number} flooring - 整数丸めを行うかどうか
 * @returns {Object} - 生成されたランダムな数値区間, 'min' - 区間の最小値, 'max' - 区間の最大値
 */
function randomInterval(min=0, max=1, step=0.1,flooring=true) {
    intMin = randomRange(min,max-step,flooring=flooring)
    intMax = randomRange(intMin+step,max,flooring=flooring)
    return {min:intMin, max:intMax}
}

/**
 * 配列をランダムに並べ替える関数
 * @param {Array} array - シャッフル対象の配列
 * @returns {Array} - ランダムに並べ替えられた配列
 */
function arrayShuffle(array) {
    for(var i = (array.length - 1); 0 < i; i--){
  
      // 0〜(i+1)の範囲で値を取得
      var r = Math.floor(Math.random() * (i + 1));
  
      // 要素の並び替えを実行
      var tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
}

/**
 * 循環する数値を1進める
 * @param {number} id - 現在の数値
 * @param {number} length - 取りうる数値の個数
 * @returns {number} - 1進められた数値
 */
function rotateId(id,length) {
    if(id < length-1){
        return id+1
    }else{
        return 0
    }
}

/**
 * Vueアプリ
 */
const app = Vue.createApp({});

/**
 * ゲームの設定を行うVueモデル
 */
const GameSetting = {
    data() {
        return {
            fixedNumPlayer:false,
            notSameName:[],
            fixedClassId:this.gameInfo.classId,
            fixedGroupId:this.gameInfo.groupId,
            fixedSessionId:this.gameInfo.sessionId
        }
    },
    mounted() {
        
    },
    computed:{
        validNumPlayer() {
            return (this.numPlayer >= minNumPlayer)&(maxNumPlayer >= this.numPlayer)
        },
        fillRequirments(){
            return Boolean(this.fixedClassId) & Boolean(this.fixedGroupId) & Boolean(this.fixedSessionId)
        },
        canProceed(){
            return this.validNumPlayer & this.fillRequirments
        }
        // notSameName(){
        //     // return this.tempPlayerNames.map((playerName,id) => playerName != this.playerList[id])
        //     return this.tempPlayerNames
        // }
    },
    methods:{
        setupGameInfo() {
            this.setGameInfo(this.fixedClassId,this.fixedGroupId,this.fixedSessionId)
        },
        checkData() {
            console.log(this)
        },
        toggleFixedNumPlayerState() {
            this.fixedNumPlayer = !this.fixedNumPlayer
        },
        initTempPlayerList() {
            // this.tempPlayerNames = this.playerList
            this.setNumPlayer(parseInt(this.numPlayer))
            this.initPlayerList()
            this.notSameName = Array(this.numPlayer).fill(false)
        },
        watchName(id) {
            // console.log(this.tempPlayerNames)
            this.notSameName[id] = this.tempPlayerNames[id] != this.playerList[id].name
        },
        updateName(id,name) {
            this.setPlayerName(id, name)
            this.watchName(id)
        },
        endSetting() {
            for (id in this.tempPlayerNames) {
                if (this.tempPlayerNames[id] != this.playerList[id].name) {
                    this.updateName(id,this.tempPlayerNames[id])
                }
            }
            this.incrementCurrentState()
            this.generateAuctionItems()
            this.assignPlayer2AuctionItem()
            this.initAuctionLog()
            // console.log(this.tempPlayerNames)
        }
    },
    props: ["gameInfo","numPlayer","setNumPlayer","playerList","initPlayerList","setPlayerName","tempPlayerNames","currentState","incrementCurrentState","decrementCurrentState","generateAuctionItems","assignPlayer2AuctionItem","initAuctionLog","setGameInfo"],
    emits: ["update:numPlayer","update:currentState"],
    template: /*html*/`
    <div id="num-player-setting"
    v-if="currentState == 0">
        <h2>基本情報を入力してください</h2>
        <div class="row">
            <div class="col">
                <label for="class-id">クラス名</label>
                <input id="class-id" class="form-control"
                v-model="fixedClassId">
            </div>
            <div class="col">
                <label for="group-id">グループ名</label>
                <input id="group-id" class="form-control"
                v-model="fixedGroupId">
            </div>
            <div class="col">
                <label for="session-id">ゲーム回数</label>
                <input id="session-id" class="form-control" 
                v-model="fixedSessionId">
            </div>
            <div class="col">
                <label for="num-player">プレイヤー人数</label>
                <div class="input-group">
                    <button type="button" class="btn btn-secondary  pe-3 ps-3"
                    @click="$emit('update:numPlayer', numPlayer-1)"> - </button>
                    <input type="number" id="num-player" class="form-control"
                        :value="numPlayer"
                        @input="$emit('update:numPlayer', $event.target.value)">    
                        <button type="button" class="btn btn-secondary  pe-3 ps-3"
                        @click="$emit('update:numPlayer', numPlayer+1)"> + </button>    
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <button type="button" class="button btn btn-primary"
                :class="{'disabled': !canProceed}"
                @click="setupGameInfo();initTempPlayerList();incrementCurrentState()">次へ</button>
            </div>
        </div>
    </div>
    <div id="player-name-setting"
    v-if="currentState == 1">
        <h1>プレイヤー名を設定してください</h1>
        <div class="row">
            <div class="col">
                <ul class="list-group">
                    <li class="list-group-item"
                    v-for="(playerName, id) in tempPlayerNames" :key="id">
                        <input class="form-control-plaintext"
                        v-model="tempPlayerNames[id]">
                    </li>
                </ul>
            </div>
            <div class="col">
                <div class="row">
                    <div class="col">
                        <button type="button" class="button btn btn-secondary"
                        @click="decrementCurrentState">戻る</button>                        
                        <button type="button" class="button btn btn-primary"
                        :class="{'disabled': !canProceed}"
                        @click="endSetting();">次へ</button>
                    </div>
                </div>
            </div>
            <div class="col-2">
            </div>
        </div>
    </div>
    `
}

/**
 * プレイヤーにカードの記載内容を表示するVueモデル
 */
const CardCheck = {
    data() {
        return {
            showingPlayer:0,
            showingPhase:0
        }
    },
    props:["playerList","auctionAssginment","auctionItems","currentState","incrementCurrentState","decrementCurrentState"],
    mounted() {
    },
    methods:{
        nextPhase() {
            this.showingPhase++
        },
        previousPhase() {
            this.showingPhase--
        },
        nextPlayer() {
            if (this.showingPlayer < this.playerList.length-1) {
                this.showingPlayer++
                this.showingPhase = 0    
            } else {
                this.showingPhase++
            }
        },
        previousPlayer() {
            if (this.showingPlayer == 0) {
                this.decrementCurrentState()
            } else {
                this.showingPlayer--
                this.showingPhase = 0
            }
        },
        proceedGame() {
            this.incrementCurrentState()
        }
    },
    template:/*html*/`
    <div id="card-check-preface"
    v-if="currentState == 2">
        <div id="card-check-before"
        v-if="showingPhase == 0">
            <h1>次の画面は<span>
                {{ playerList[showingPlayer].name }}
            </span>さんだけが見てください</h1>
            <button type="button" class="btn btn-secondary"
            @click="previousPlayer()">戻る</button>
            <button type="button" class="button btn btn-primary"
                    @click="nextPhase()">次へ</button>
        </div>
        <div id="card-check"
        v-if="showingPhase == 1">
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h1 class="card-title">請求書</h1>
                            <h2><u>{{ playerList[showingPlayer].name }} 様</u></h2>
                            <p class="card-text">あなたは以下の絵画を以下の値段で仕入れました。</p>
                            <h4><u>絵画番号 {{ auctionAssginment[showingPlayer].sell }}</u></h4>
                            <h4><u>請求額 {{ auctionItems[auctionAssginment[showingPlayer].sell].buy }} コイン</u></h4>
                            <p class="card-text">オークション終了時の精算で、上記コインを場に支払ってください。</p>  
                        </div>
                    </div>  
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h1 class="card-title">鑑定書</h1>
                            <h2><u>{{ playerList[showingPlayer].name }} 様</u></h2>
                            <p class="card-text">以下の絵画を鑑定した結果、以下の値段の価値がある事を保証します。</p>    
                            <h4><u>絵画番号 {{ auctionAssginment[showingPlayer].appr }}</u></h4>
                            <h4><u>鑑定額 {{ auctionItems[auctionAssginment[showingPlayer].appr].interval.min }} コイン<br/>から {{ auctionItems[auctionAssginment[showingPlayer].appr].interval.max }} コイン</u></h4>
                        </div>
                    </div>
                </div>
            </div>
            <p class="lead">
                絵画番号と金額を手元の請求書と鑑定書にメモをしてください。<br/>
                <span
                v-if="showingPlayer < playerList.length -1">メモが終わったら「次へ」をタップして次のプレイヤーに画面を見せてください。</span>
                <span
                v-else>メモが終わったら「次へ」をタップして全てのプレイヤーに画面を見せてください。</span>
            </p>
            <button type="button" class="btn btn-secondary"
            @click="previousPhase()">戻る</button>
            <button type="button" class="button btn btn-primary"
            @click="nextPlayer()">次へ</button>
        </div>
        <div id="card-check"
        v-if="showingPhase == 2">
            <h1>オークションの開始</h1>
            <p>全員が画面を見てください。</p>
            <p class="lead">
                次からオークションが開始します。<br/>
                オークションは絵画番号0から順に出品が行われ、各プレイヤーが順に入札を行います。<br/>
                入札順はランダムに決定されます。
            </p>
            <button type="button" class="btn btn-secondary"
            @click="previousPhase()">戻る</button>
            <button type="button" class="button btn btn-primary"
            @click="proceedGame()">次へ</button>
        </div>
    </div>
    `
}

/**
 * ゲームのメインルーチンのVueモデル
 */
const GameMain = {
    data() {
        return {
            itemId:0,
            turnId:0,
            orderId:0,
            tempBid:1,
            finished:false
        }
    },
    computed: {
        invalidToBid() {
            history_ = this.auctionLog[this.itemId].history
            // console.log(history_)
            if (history_.length > 0) {
                maxBid = history_.reduce(
                    (mx,elem) => {return {bid:Math.max(mx.bid,elem.bid)}}
                ).bid
            } else {
                maxBid = 1
            }
            currentPlayer = history_.filter(elem => elem.playerId==this.auctionLog[this.itemId].order[this.orderId])
            if (currentPlayer.length > 0) {
                maxBid = Math.max(
                    maxBid,
                    currentPlayer.reduce(
                        (mx,elem) => {
                            return {bid:Math.max(mx.bid,elem.bid)}
                        }
                    ).bid+1
                )
            }
            return this.tempBid < maxBid
        }
    },
    methods: {
        placeBid() {
            orderLength = this.stepTurn(this.itemId,this.auctionLog[this.itemId].order[this.orderId],this.tempBid,drop=false).orderLength
            this.turnId++
            if (this.orderId < orderLength-1) {
                this.orderId++
            } else {
                this.orderId = 0
            }
        },
        dropBid() {
            orderLength = this.stepTurn(this.itemId,this.auctionLog[this.itemId].order[this.orderId],this.tempBid,drop=true).orderLength
            this.turnId++
            if (this.orderId > orderLength-1) {
                this.orderId = 0
            }
            // if (this.orderId < orderLength-1) {
            //     this.orderId++
            // } else {
            //     this.orderId = 0
            // }
            finished = orderLength == 1
            this.finished = finished
            if (finished) {
                this.finalizeAuctionItem(this.itemId,this.auctionLog[this.itemId].order[0],this.tempBid)
            }
            return finished
        },
        nextItem() {
            
            if (this.itemId < this.auctionItems.length -1) {
                this.itemId++
                this.turnId = 0
                this.orderId = 0
                this.tempBid = 1
                this.finished = false    
            } else {
                this.uploadResult()
                this.incrementCurrentState()
            }
        }
    },
    props:["playerList","auctionAssginment","auctionItems","auctionLog","currentState","incrementCurrentState","decrementCurrentState","stepTurn","finalizeAuctionItem","checkPayment","uploadResult"],
    template:/*html*/`
    <div id="game-main"
    v-if="currentState == 3">
        <h1>絵画番号 {{ itemId }} のオークション</h1>
        <div class="row">
            <div class="col">
                <div
                v-if="!finished">
                    <h3>現在の入札者 {{ playerList[auctionLog[itemId].order[orderId]].name }} さん</h3>
                    <p class="lead">
                        入札を行うかこの出品を棄権するかを選択してください。<br/>
                        入札額は直前のプレイヤーの入札額以上で、かつ自分の最後の入札額より大きい必要があります。
                    </p>
                    <div class="input-group">
                        <button type="button" class="btn btn-danger me-2"
                        @click="dropBid()">棄権</button>
                        <button type="button" class="btn btn-secondary  pe-3 ps-3"
                        @click="tempBid--"> - </button>
                        <input type="number" class="form-control"
                        v-model.number="tempBid">
                        <button type="button" class="btn btn-secondary ps-3 ps-3"
                        @click="tempBid++"> + </button>
                        <button type="button" class="btn btn-primary ms-2"
                        @click="placeBid()" :class="{disabled: invalidToBid}">入札</button>
                    </div>
                    <h3>入札順</h3>
                    <ul class="list-group list-group-horizontal">
                        <li class="list-group-item"
                        v-for="(player, pId) in auctionLog[itemId].order"
                        :class="{'list-group-item-info': pId == orderId}"
                        :key="pId">{{ playerList[auctionLog[itemId].order[pId]].name }}</li>
                    </ul>
                </div>  
                <div
                v-else>
                    <h2>入札が終了しました</h2>
                    <h3><u>落札者 {{ playerList[auctionLog[itemId].order[orderId]].name }}</u></h3>
                    <h3><u>落札額 {{ auctionLog[itemId].bid }} コイン</u></h3>
                    <button type="button" class="btn btn-primary"
                    @click="nextItem()">次の出品へ</button>
                </div>
            </div>
            <div class="col overflow-auto">
                <h3>履歴</h3>
                <ul class="list-group">
                    <li class="list-group-item"
                    v-for="(turn, id) in auctionLog[itemId].history"
                    :key="id">
                        {{ playerList[turn.playerId].name }} が 
                        <span v-if="turn.bid != 0">{{ turn.bid }} コイン入札しました</span>
                        <span v-else>棄権しました</span>
                    </li>
                    <li class="list-group-item"
                    v-if="auctionLog[itemId].bid">
                        {{ playerList[auctionLog[itemId].buyer].name }} が {{ auctionLog[itemId].bid }} コインで落札しました
                    </li>
                </ul>
            </div>
        </div>
    </div>
    `
}


/**
 * 可視化のVueモデル
 */
const Analyzer = {
    data() {
        return {
            first_x: '<b>開始</b>',
            last_x: '<b>終了</b>',
            first_y: 0,
            color_setting: {
                bid: 'royalblue',
                sell: 'firebrick',
                buy: 'darkorchid',
                appr: 'mediumseagreen'
            },
            x_base:[],
            y_base:[],
            tagId:"item"+this.itemId
        }
    },
    computed:{
        last_y(){
            return this.y_base[this.y_base.length-1]
        },
        appr_min() {
            return this.playData.auctionItems[this.itemId].interval.min
        },
        appr_max() {
            return this.playData.auctionItems[this.itemId].interval.max
        },
        buy_price() {
            return this.playData.auctionItems[this.itemId].buy
        },
        sell_price() {
            return this.playData.auctionItems[this.itemId].sell
        },
        buyer_name() {
            return this.playData.playerList[this.playData.auctionAssginment[this.itemId].sell].name
        },
        appr_name() {
            return this.playData.playerList[this.playData.auctionAssginment[this.itemId].appr].name
        },
        bidder_name() {
            return this.playData.playerList[this.playData.auctionLog[this.itemId].buyer].name
        },
        item_name() {
            return '絵画'+this.itemId
        },
        trace_data() {
            var log = {
                x: [this.first_x,this.x_base,this.last_x].flat(),
                y: [this.first_y,this.y_base,this.last_y].flat(),
                mode: 'lines+markers',
                name: '入札額',
                line:{shape: 'hv',color: this.color_setting.bid}
            };
            var range = {
                x: [this.first_x,this.x_base,this.last_x,this.last_x,this.x_base,this.first_x,this.first_x].flat(),
                y: [Array(this.x_base.length+2).fill(this.appr_max),Array(this.x_base.length+2).fill(this.appr_min),this.appr_max].flat(),
                name: '鑑定額(上限)',
                fill: 'tozerox',
                line: {color: this.color_setting.appr}
            };
            var range_min = {
                x: [this.first_x,this.x_base,this.last_x].flat(),
                y: Array(this.x_base.length+2).fill(this.appr_min),
                name: '鑑定額(下限)',
                mode: 'lines',
                fill: 'tozerox',
                line: {color: this.color_setting.appr}
            };
            var selling = {
                x: [this.first_x,this.x_base,this.last_x].flat(),
                y: Array(this.x_base.length+2).fill(this.sell_price),
                name: '売却額',
                mode: 'lines',
                line: {
                    dash: 'dash',
                    color: this.color_setting.sell
                }
            }
            var buying = {
                x: [this.first_x,this.x_base,this.last_x].flat(),
                y: Array(this.x_base.length+2).fill(this.buy_price),
                name: '仕入れ額',
                mode: 'lines',
                line: {
                    dash: 'dot',
                    color: this.color_setting.buy
                }
            };
            
            return [range,range_min,selling,buying,log]
        },
        options() {
            // var buyer = {
            //     x: this.first_x,
            //     y: this.buy_price,
            //     xanchor: 'right',
            //     yanchor: 'middle',
            //     showarrow: false,
            //     font: {
            //         family: 'Arial',
            //         size: 16,
            //         color: 'black'
            //       },
            //     text: '仕入れ<br>('+this.buyer_name+')'
            // };
            // var appraisal = {
            //     x: this.first_x,
            //     y: this.appr_max,
            //     xanchor: 'right',
            //     yanchor: 'middle',
            //     showarrow: false,
            //     font: {
            //         family: 'Arial',
            //         size: 16,
            //         color: 'black'
            //       },
            //     text: '鑑定<br>('+this.appr_name+')'
            // };
            var bidder = {
                x: this.last_x,
                y: this.last_y,
                xanchor: 'left',
                yanchor: 'middle',
                showarrow: false,
                font: {
                    family: 'Arial',
                    size: 16,
                    color: 'black'
                  },
                text: '<span style="color:'+this.color_setting.bid+';"> '+this.bidder_name+' </span>'
            };
            return {
                title: this.item_name,
                annotations:[bidder]
            }
        }
    },
    methods:{
    },
    mounted: function() {
        console.log("analyzing");
        var players = [];
        var turn_num = 1;
        this.playData.auctionLog[this.itemId].history.map((turn,id) => {
            if (players.includes(turn.playerId)){
                turn_num ++;
                players = [];
            }
            players.push(turn.playerId);
            var player_color = '';
            if (turn.playerId == this.playData.auctionAssginment[this.itemId].sell){
                player_color = this.color_setting.buy
            } else if (turn.playerId == this.playData.auctionAssginment[this.itemId].appr) {
                player_color = this.color_setting.appr
            } else if (turn.playerId == this.playData.auctionLog[this.itemId].buyer){

            }
            var player_name = '<b style="color: '+player_color+'">'+this.playData.playerList[turn.playerId].name+'</b>' + '<br>' + turn_num +'回目';
            if (turn.bid != 0) {
                this.x_base.push(player_name);
                this.y_base.push(turn.bid);
            } else {
                this.x_base.push(player_name);
                this.y_base.push(turn.bid);
                this.x_base.push(player_name);
                this.y_base.push(this.y_base[this.y_base.length-2])
            }
        });
        Plotly.plot(this.tagId, this.trace_data, this.options);
    },
    props:['playData','itemId'],
    components:{},
    template:/*html*/`
    <div :id="tagId"></div>
    `
}

/**
 * ゲーム終了後の収支状況を表示するVueモデル
 */
const GamePayment = {
    data() {
        return {
            sessionUrl:null,
            uploaded:false,
            view:'table'
        }
    },
    props:["gameInfo","playerList","auctionAssginment","auctionItems","auctionLog","currentState","incrementCurrentState","decrementCurrentState","checkPayment","checkResult","uploadPlayData","env"],
    computed:{
        fileName() {
            return "playdata.json" // 時刻とか何らかの識別子入れる
        },
        playData() {
            return {
                gameInfo:this.gameInfo,
                playerList:this.playerList,
                auctionAssginment:this.auctionAssginment,
                auctionItems:this.auctionItems,
                auctionLog:this.auctionLog,
                result:this.checkResult()
            }
        },
        jsonData() {
            jsonData = JSON.stringify({
                gameInfo:this.gameInfo,
                playerList:this.playerList,
                auctionAssginment:this.auctionAssginment,
                auctionItems:this.auctionItems,
                auctionLog:this.auctionLog,
                result:this.checkResult()
            })
            return jsonData
        }
    },
    methods:{
        jasonify() {
            jsonData = {
                gameInfo:this.gameInfo,
                playerList:this.playerList,
                auctionAssginment:this.auctionAssginment,
                auctionItems:this.auctionItems,
                auctionLog:this.auctionLog,
                result:this.checkResult()
            }
            return jsonData
        },
        createDownloadUrl() {
            blob = new Blob([this.jsonData], { type: 'application/json' })
            this.sessionUrl = window.URL.createObjectURL(blob)
        },
        upload(){
            this.uploadPlayData(this.jsonData)
            this.uploaded = true
        },
        toggle(){
            if (this.view == 'table') {
                this.view = 'plot'
            } else {
                this.view = 'table'
            }
            console.log(this.view)
        }
    },
    components:{'analyzer':Analyzer},
    template:/*html*/`
    <div id="payment"
    v-if="currentState == 4">
        <table class="table" v-if="view == 'table'">
            <thead>
                <tr>
                    <th></th>
                    <th
                    v-for="(player,pId) in playerList"
                    :key="pId">
                        <h1>{{ player.name }}</h1>
                        <h2>合計 {{ checkResult()[pId] }}</h2>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                v-for="(auctionItem,iId) in auctionItems"
                :key="iId">
                    <th>
                        <h3>絵画番号 {{ iId }}</h3>
                        <p>仕入額 {{ auctionItem.buy }} コイン</p>
                        <p>売却額 {{ auctionItem.sell }} コイン</p>
                        <p>鑑定額  {{ auctionItem.interval.min }} から {{ auctionItem.interval.max }} コイン</p>
                    </th>
                    <td
                    v-for="(player,pId) in playerList"
                    :key="pId">
                        <h3>小計 {{ checkPayment(iId, pId).total }}</h3>
                        <p class="lead"
                        v-if="auctionAssginment[pId].sell == iId">出品者</p>
                        <p class="lead"
                        v-if="auctionAssginment[pId].appr == iId">鑑定者</p>
                        <p
                        v-if="checkPayment(iId, pId).buyUp != 0">仕入支払 - {{ checkPayment(iId, pId).buyUp }} コイン</p>
                        <p
                        v-if="checkPayment(iId, pId).buyBid != 0">落札支払 - {{ checkPayment(iId, pId).buyBid }} コイン</p>
                        <p
                        v-if="checkPayment(iId, pId).sellBid != 0">落札受取 {{ checkPayment(iId, pId).sellBid }} コイン</p>
                        <p
                        v-if="checkPayment(iId, pId).sellUp != 0">売却受取 {{ checkPayment(iId, pId).sellUp }} コイン</p>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="view == 'plot'">
            <analyzer v-for="(item,index) in playData.auctionItems" :key="item" :play-data="playData" :item-id="index"></analyzer>
        </div>
        <a type="button" class="btn btn-info mt-3" id="dataDL"
        :href="sessionUrl" :download="fileName" @click="createDownloadUrl">プレイデータをDL</a>
        <a type="button" class="btn btn-info mt-3" id="dataUL"
        v-if="env=='gas'" @click="upload" :class="{'disabled': uploaded}">プレイデータをUL</a>
        <button type="button" class="btn btn-info mt-3" id="dataAnalyze"
        @click="toggle">表示を切り替え</button>
    </div>
    `
}

/**
 * ゲーム全体のVueモデル
 */
const Game = {
    data() {
        return {
            gameInfo:{
                classId:"",
                groupId:"",
                sessionId:""
            },
            numPlayer:minNumPlayer,
            playerList:[],
            auctionItems:[],
            currentState:0,
            auctionAssginment:[],
            auctionLog:[],
            debug:debug,
            env:env
        }
    },
    computed:{
        playerNames() {
            return this.playerList.map(player => player.name)
        }
    },
    methods:{
        setGameInfo(classId,groupId,sessionId){
            this.gameInfo.classId = classId
            this.gameInfo.groupId = groupId
            this.gameInfo.sessionId = sessionId
        },
        checkData() {
            console.log(this)
        },
        setNumPlayer(n) {
            this.numPlayer = n
        },
        initPlayerList() {
            this.playerList = [...Array(this.numPlayer).keys()].map(i => {return {name:"Player"+(i+1)}})
        },
        setPlayerName(id,name) {
            this.playerList[id].name = name;
        },
        generateAuctionItems() {
            this.auctionItems = Array(this.numPlayer).fill(null).map((item,id) => {
                interval = randomInterval(0,maxToken,1)
                prices = randomInterval(interval.min, interval.max,1)
                return {interval:interval,buy:prices.min,sell:prices.max}
            })
        },
        assignPlayer2AuctionItem() {
            itemNums = [...Array(this.numPlayer).keys()]
            arrayShuffle(itemNums)
            this.auctionAssginment = itemNums.map((i,id) => {return {sell:i,appr:itemNums[rotateId(id,itemNums.length)]}})
        },
        incrementCurrentState() {
            this.currentState++
        },
        decrementCurrentState() {
            this.currentState--
        },
        initAuctionLog() {
            this.auctionLog = Array(this.numPlayer).fill(null).map((item,id) => {
                return {
                    order:arrayShuffle([...Array(this.numPlayer).keys()]),
                    buyer:null,
                    bid:0,
                    history:[],
                }
            })
        },
        stepTurn(itemId,playerId,bid,drop=false) {
            orderLength = this.auctionLog[itemId].order.length
            if (drop) {
                this.auctionLog[itemId].history.push({
                    playerId:playerId,
                    bid:0
                })
                this.auctionLog[itemId].order = this.auctionLog[itemId].order.filter(pId => pId != playerId)
                orderLength--
            } else {
                this.auctionLog[itemId].history.push({
                    playerId:playerId,
                    bid:bid
                })
            }
            return {orderLength:orderLength}
        },
        finalizeAuctionItem(itemId,playerId,bid) {
            this.auctionLog[itemId].buyer = playerId,
            this.auctionLog[itemId].bid = bid
        },
        checkPayment(itemId, playerId) {
            buyUp = 0
            buyBid = 0
            sellBid = 0
            sellUp = 0

            if (this.auctionAssginment[playerId].sell == itemId) {
                buyUp = this.auctionItems[itemId].buy
                sellBid = this.auctionLog[itemId].bid
            }

            if (this.auctionLog[itemId].buyer == playerId) {
                buyBid = this.auctionLog[itemId].bid
                sellUp = this.auctionItems[itemId].sell
            }

            total = sellBid + sellUp - buyUp - buyBid

            return {
                buyUp:buyUp,
                buyBid:buyBid,
                sellBid:sellBid,
                sellUp:sellUp,
                total:total
            }
        },
        checkResult() {
            totals = [...Array(this.numPlayer).keys()].map((pId) => {
                return [...Array(this.numPlayer).keys()].map((iId) => {
                    return this.checkPayment(iId, pId).total
                }).reduce((sum, elem) => sum + elem,0)
            })
            return totals
        },
        uploadResult() {
            result = {
                numPlayer:this.numPlayer,
                playerList:this.playerList,
                auctionItems:this.auctionItems,
                auctionAssginment:this.auctionAssginment,
                auctionLog:this.auctionLog
            }
            console.log(result)
        },
        resetGame() {
            this.playerList=[]
            this.auctionItems=[]
            this.currentState=0
            this.auctionAssginment=[]
            this.auctionLog=[]
        },
        uploadPlayData(json) {
            google.script.run.withSuccessHandler(this.successMessage).submit(json)
        },
        successMessage(response) {
            alert('送信が完了しました\n')
            console.log(JSON.parse(response))
        },
    },
    components:{'game-setting': GameSetting,"card-check": CardCheck,"game-main":GameMain,"game-payment":GamePayment},
    template:/*html*/`
    <button type="button" class="btn btn-secondary"
    @click="resetGame()"
    v-if="currentState != 0">はじめから</button>
    <game-setting
    v-model:num-player="numPlayer"
    v-model:player-list="playerList"
    v-model:set-player-name="setPlayerName"
    :game-info="gameInfo"
    :set-num-player="setNumPlayer"
    :init-player-list="initPlayerList"
    :temp-player-names="playerNames"
    :current-state="currentState"
    :increment-current-state="incrementCurrentState"
    :decrement-current-state="decrementCurrentState"
    :generate-auction-items="generateAuctionItems"
    :assign-player2-auction-item="assignPlayer2AuctionItem"
    :init-auction-log="initAuctionLog"
    :set-game-info="setGameInfo"></game-setting>

    <card-check
    :player-list="playerList"
    :auction-assginment="auctionAssginment"
    :auction-items="auctionItems"
    :current-state="currentState"
    :increment-current-state="incrementCurrentState"
    :decrement-current-state="decrementCurrentState"></card-check>

    <game-main
    :player-list="playerList"
    :auction-assginment="auctionAssginment"
    :auction-items="auctionItems"
    :current-state="currentState"
    :increment-current-state="incrementCurrentState"
    :decrement-current-state="decrementCurrentState"
    :step-turn="stepTurn"
    :auction-log="auctionLog"
    :finalize-auction-item="finalizeAuctionItem"
    :check-payment="checkPayment"
    :upload-result="uploadResult"></game-main>

    <game-payment
    :game-info="gameInfo"
    :player-list="playerList"
    :auction-assginment="auctionAssginment"
    :auction-items="auctionItems"
    :current-state="currentState"
    :increment-current-state="incrementCurrentState"
    :decrement-current-state="decrementCurrentState"
    :auction-log="auctionLog"
    :check-payment="checkPayment"
    :check-result="checkResult"
    :upload-play-data="uploadPlayData"
    :env="env"></game-payment>

    <div
    v-if="debug">
    <button type="button" class="btn btn-secondary"
    @click="decrementCurrentState()">戻す</button>
    <button type="button" class="btn btn-secondary"
    @click="incrementCurrentState()">進む</button>
    <button type="button" class="btn btn-info"
    @click="checkData()">確認</button>
    </div>
    `
}

app.component('game', Game)

/**
 * ゲームアプリがマウントされたVueモデル
 */
const vm = app.mount('#app');

// サンプルデータ
// プレイヤー情報
// [ { "name": "Player1" }, { "name": "Player2" }, { "name": "Player3" }, { "name": "Player4" } ]
// プレイヤーと絵画
// [ { "sell": 3, "appr": 0 }, { "sell": 0, "appr": 2 }, { "sell": 2, "appr": 1 }, { "sell": 1, "appr": 3 } ]
// 絵画
// [ { "interval": { "min": 17, "max": 19 }, "buy": 17, "sell": 18 }, { "interval": { "min": 8, "max": 9 }, "buy": 8, "sell": 9 }, { "interval": { "min": 6, "max": 11 }, "buy": 8, "sell": 10 }, { "interval": { "min": 6, "max": 8 }, "buy": 6, "sell": 7 } ]
// オークションログ
// [ { "order": [ 1 ], "buyer": 1, "bid": 1, "history": [ { "playerId": 0, "bid": 0 }, { "playerId": 3, "bid": 0 }, { "playerId": 2, "bid": 0 } ] }, { "order": [ 1 ], "buyer": 1, "bid": 1, "history": [ { "playerId": 0, "bid": 0 }, { "playerId": 3, "bid": 0 }, { "playerId": 2, "bid": 0 } ] }, { "order": [ 2 ], "buyer": 2, "bid": 1, "history": [ { "playerId": 3, "bid": 0 }, { "playerId": 1, "bid": 0 }, { "playerId": 2, "bid": 1 }, { "playerId": 0, "bid": 0 } ] }, { "order": [ 2 ], "buyer": 2, "bid": 1, "history": [ { "playerId": 0, "bid": 0 }, { "playerId": 3, "bid": 0 }, { "playerId": 1, "bid": 0 } ] } ]