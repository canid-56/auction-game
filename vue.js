var debug=false;

const minNumPlayer = 4;
const maxNumPlayer = 10;
const maxToken = 20;

function randomRange(min=0, max=1,flooring=true){
    return Math.floor(Math.random() * (max-min) + min)
}

function randomInterval(min=0, max=1, step=0.1,flooring=true) {
    intMin = randomRange(min,max-step,flooring=flooring)
    intMax = randomRange(intMin+step,max,flooring=flooring)
    return {min:intMin, max:intMax}
}

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

function rotateId(id,length) {
    if(id < length-1){
        return id+1
    }else{
        return 0
    }
}

const app = Vue.createApp({});

const GameSetting = {
    data() {
        return {
            fixedNumPlayer:false,
            notSameName:[]
        }
    },
    mounted() {
        
    },
    computed:{
        notValidNumPlayer() {
            return (this.numPlayer < minNumPlayer)|(maxNumPlayer < this.numPlayer)
        },
        // notSameName(){
        //     // return this.tempPlayerNames.map((playerName,id) => playerName != this.playerList[id])
        //     return this.tempPlayerNames
        // }
    },
    methods:{
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
    props: ["numPlayer","setNumPlayer","playerList","initPlayerList","setPlayerName","tempPlayerNames","currentState","incrementCurrentState","decrementCurrentState","generateAuctionItems","assignPlayer2AuctionItem","initAuctionLog"],
    emits: ["update:numPlayer","update:currentState"],
    template: /*html*/`
    <div id="num-player-setting"
    v-if="currentState == 0">
        <h1>何人で遊びますか？</h1>
        <div class="row">
            <div class="col">
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
            <div class="col">
                <button type="button" class="button btn btn-primary"
                :class="{'disabled': notValidNumPlayer}"
                @click="initTempPlayerList();incrementCurrentState()">次へ</button>
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
                        :class="{'disabled': notValidNumPlayer}"
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
                            <h4><u>鑑定額 {{ auctionItems[auctionAssginment[showingPlayer].sell].interval.min }} コイン<br/>から {{ auctionItems[auctionAssginment[showingPlayer].sell].interval.max }} コイン</u></h4>
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

const GamePayment = {
    data() {
        return {
            sessionUrl:null
        }
    },
    props:["playerList","auctionAssginment","auctionItems","auctionLog","currentState","incrementCurrentState","decrementCurrentState","checkPayment","checkResult"],
    computed:{
        fileName() {
            return "playdata.json" // 時刻とか何らかの識別子入れる
        },
        jsonData() {
            jsonData = JSON.stringify({
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
        }
    },
    template:/*html*/`
    <div id="payment"
    v-if="currentState == 4">
        <table class="table">
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
        <a type="button" class="btn btn-info mt-3" id="dataDL"
        :href="sessionUrl" :download="fileName" @click="createDownloadUrl">プレイデータをDL</a>
    </div>
    `
}

const Game = {
    data() {
        return {
            numPlayer:minNumPlayer,
            playerList:[],
            auctionItems:[],
            currentState:0,
            auctionAssginment:[],
            auctionLog:[],
            debug:debug
        }
    },
    computed:{
        playerNames() {
            return this.playerList.map(player => player.name)
        }
    },
    methods:{
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
        }
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
    :set-num-player="setNumPlayer"
    :init-player-list="initPlayerList"
    :temp-player-names="playerNames"
    :current-state="currentState"
    :increment-current-state="incrementCurrentState"
    :decrement-current-state="decrementCurrentState"
    :generate-auction-items="generateAuctionItems"
    :assign-player2-auction-item="assignPlayer2AuctionItem"
    :init-auction-log="initAuctionLog"></game-setting>

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
    :player-list="playerList"
    :auction-assginment="auctionAssginment"
    :auction-items="auctionItems"
    :current-state="currentState"
    :increment-current-state="incrementCurrentState"
    :decrement-current-state="decrementCurrentState"
    :auction-log="auctionLog"
    :check-payment="checkPayment"
    :check-result="checkResult"></game-payment>

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