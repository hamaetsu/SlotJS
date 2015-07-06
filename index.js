//定数

var SCREEN_WIDTH  = 600/2;
var SCREEN_HEIGHT = (480)/2+50;
/*
var SCREEN_WIDTH  = 960;
var SCREEN_HEIGHT = 640;
*/

var KOMA        = 21;
var KOMA_HEIGHT = 160/2;

// リールのスピード これを違う数値にすると何かがおかしくなる
var SPEED = KOMA_HEIGHT/2;

var chk1,chk2,chk3;

var PRZ_HZR   = 0;
var PRZ_RPLY  = 1;
var PRZ_BELL  = 2;
var PRZ_SIK   = 3;
var PRZ_CHE   = 4;
var PRZ_BAR   = 5;
var PRZ_STAR  = 6;
var PRZ_LVUP  = 7;
var PRZ_NEXT  = 8;
var PRZ_BLANK = 9;

// ウェイトの時間 4.1秒
var WAIT_TIME = 4210;

//画像
var ASSETS = {
    "reel1":  "http://kneesockscollector.net/resource/reel1.png",
    "reel2" : "http://kneesockscollector.net/resource/reel2.png",
    "reel3" : "http://kneesockscollector.net/resource/reel3.png"      
};


//------------------------------------------
//  main
//------------------------------------------
tm.main(function() {
    var app = tm.display.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();
    app.background = "rgba(0, 0, 0, 1.0)";
    app.fps = 30;  
    app.replaceScene( tm.app.LoadingScene({
        assets: ASSETS,
        nextScene: GameScene,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    }));
    app.run();
});


//------------------------------------------
//  GameScene
//------------------------------------------
tm.define("GameScene", {
    superClass: "tm.app.Scene",
    
    init: function() {
        this.superInit();

        //　変数定義
        // リールが動いているかどうかのフラグ
        var flgMove1 = false;
        var flgMove2 = false;
        var flgMove3 = false;
        
        // リールが全て停止しているかどうかのフラグ
        var flgAllStop = true;
        var startTime = 0; // ウェイトを実装するための変数

        var slip1;
        var slip2;
        var slip3;

        //リール図柄
        var reel1 = [PRZ_BELL, PRZ_RPLY, PRZ_NEXT, PRZ_BAR,
                     PRZ_BAR,  PRZ_BELL, PRZ_RPLY, PRZ_BLANK,
                     PRZ_BELL, PRZ_LVUP, PRZ_RPLY, PRZ_LVUP,
                     PRZ_BELL, PRZ_STAR, PRZ_SIK,  PRZ_RPLY,
                     PRZ_BELL, PRZ_CHE,  PRZ_RPLY,  PRZ_SIK, PRZ_STAR];

        var reel2 = [PRZ_BELL, PRZ_NEXT, PRZ_RPLY, PRZ_NEXT,
                     PRZ_CHE,  PRZ_BELL, PRZ_BAR,  PRZ_RPLY,
                     PRZ_SIK,  PRZ_SIK,  PRZ_BELL, PRZ_LVUP,
                     PRZ_RPLY, PRZ_STAR, PRZ_BLANK,PRZ_BELL,
                     PRZ_BAR,  PRZ_RPLY, PRZ_BELL, PRZ_STAR, PRZ_RPLY];

        var reel3 = [PRZ_BELL, PRZ_SIK,  PRZ_NEXT,  PRZ_RPLY,
                     PRZ_BELL, PRZ_RPLY, PRZ_BAR,   PRZ_SIK,
                     PRZ_BELL, PRZ_RPLY, PRZ_BLANK, PRZ_LVUP,
                     PRZ_BELL, PRZ_RPLY, PRZ_STAR,  PRZ_BAR,
                     PRZ_BELL, PRZ_RPLY, PRZ_CHE,   PRZ_STAR, PRZ_RPLY];

        /***********************************************************************************
         * 以下リールの配置
         ***********************************************************************************/
        var imgReel1_1 = tm.display.Sprite("reel1", SCREEN_WIDTH/3, 3360/2);
        var imgReel1_2 = tm.display.Sprite("reel1", SCREEN_WIDTH/3, 3360/2);
        var imgReel2_1 = tm.display.Sprite("reel2", SCREEN_WIDTH/3, 3360/2);
        var imgReel2_2 = tm.display.Sprite("reel2", SCREEN_WIDTH/3, 3360/2);
        var imgReel3_1 = tm.display.Sprite("reel3", SCREEN_WIDTH/3, 3360/2);
        var imgReel3_2 = tm.display.Sprite("reel3", SCREEN_WIDTH/3, 3360/2);

        var reel_width = imgReel1_1.width; // リールの横幅
        var reel_to_reel_width = 2;        // リール間距離

        imgReel1_1.setPosition( reel_width/2, -(Math.floor(KOMA/2)-3)*KOMA_HEIGHT );
        imgReel1_1.addChildTo(this);        
        imgReel1_2.setPosition( reel_width/2, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
        imgReel1_2.addChildTo(this);
        
        imgReel2_1.setPosition( reel_width*3/2 + reel_to_reel_width, -(Math.floor(KOMA/2)-3)*KOMA_HEIGHT );
        imgReel2_1.addChildTo(this);
        imgReel2_2.setPosition( reel_width*3/2 + reel_to_reel_width, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
        imgReel2_2.addChildTo(this);

        imgReel3_1.setPosition( reel_width*5/2 + 2*reel_to_reel_width, -(Math.floor(KOMA/2)-3)*KOMA_HEIGHT );
        imgReel3_1.addChildTo(this);
        imgReel3_2.setPosition( reel_width*5/2 + 2*reel_to_reel_width, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
        imgReel3_2.addChildTo(this);

        init_height_1 = -(Math.floor(KOMA/2)-3)*KOMA_HEIGHT;
        init_height_2 = -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT;
        console.log("init_height_1 : " + init_height_1);
        console.log("init_height_2 : " + init_height_2);
        /***********************************************************************************
         * リール配置ここまで
         ***********************************************************************************/


        var shapeSub = tm.display.RectangleShape( SCREEN_WIDTH, 50, {
            fillStyle  : "#000000"
        });
        shapeSub.addChildTo(this);
        shapeSub.setPosition(shapeSub.width/2, SCREEN_HEIGHT-shapeSub.height/2); 



        /***********************************************************************************
         * 停止ボタンの配置
         ***********************************************************************************/
        var stopBtn1 = tm.display.CircleShape( shapeSub.height-5, shapeSub.height-5, {
            fillStyle  : "#ff7777",
            strokeStyle: "#ffffff",
            lineWidth  : 3
        });
        stopBtn1.addChildTo(this);
        stopBtn1.setPosition(imgReel1_1.x,shapeSub.y); 
        stopBtn1.setInteractive(true);
        stopBtn1.onpointingstart = function(e) {
            if( flgMove1 ) {
                flgMove1 = false; // リールが動いているかどうかのフラグ
                //本当は引いた役があればそこまで（４コマ以内なら）ずらさないといけない
                slip1 = 0;
                while( (imgReel1_1.y%KOMA_HEIGHT+slip1)%KOMA_HEIGHT!=KOMA_HEIGHT/2) {
                    slip1 += SPEED;
                }   
            }
        };
        var stopBtn2 = tm.display.CircleShape( shapeSub.height-5, shapeSub.height-5, {
            fillStyle  : "#ff7777",
            strokeStyle: "#ffffff",
            lineWidth  : 3
        });
        stopBtn2.addChildTo(this);
        stopBtn2.setPosition(imgReel2_1.x,shapeSub.y); 
        stopBtn2.setInteractive(true);
        stopBtn2.onpointingstart = function(e) {
            if( flgMove2 ) {
                flgMove2 = false;
                slip2 = 0;
                while( (imgReel2_1.y%KOMA_HEIGHT+slip2)%KOMA_HEIGHT!=KOMA_HEIGHT/2) {
                    slip2 += SPEED;
                }   
            }
        }; 
        var stopBtn3 = tm.display.CircleShape( shapeSub.height-5, shapeSub.height-5, {
            fillStyle  : "#ff7777",
            strokeStyle: "#ffffff",
            lineWidth  : 3
        });
        stopBtn3.addChildTo(this);
        stopBtn3.setPosition(imgReel3_1.x,shapeSub.y); 
        stopBtn3.setInteractive(true);
        stopBtn3.onpointingstart = function(e) {
            if( flgMove3 ) {
                flgMove3 = false;
                slip3 = 0;
                while( (imgReel3_1.y%KOMA_HEIGHT+slip3)%KOMA_HEIGHT!=KOMA_HEIGHT/2) {
                    slip3 += SPEED;
                }   
            }
        };
        /***********************************************************************************
         * ボタンの配置
         ***********************************************************************************/

        start = function() {
            console.log("start!!");
            flgAllStop = false;
            flgMove1=true;
            flgMove2=true;
            flgMove3=true;
        };

        getPrize = function() {
            rand = Math.floor(Math.random() * 65536);
            return rand;
        }

        function sleep(T) {
            var d1 = new Date().getTime(); 
            var d2 = new Date().getTime(); 
            while( d2 < d1+T ) {    //T秒待つ 
                d2=new Date().getTime(); 
             } 
            return;  
        }

        this.update = function(app) {

            if( flgMove1 || slip1>0 ) {
                imgReel1_1.setPosition( imgReel1_1.x, imgReel1_1.y+SPEED );
                imgReel1_2.setPosition( imgReel1_2.x, imgReel1_2.y+SPEED );
                slip1-=SPEED;
                if( imgReel1_1.y >= (Math.floor(KOMA/2)+4)*KOMA_HEIGHT ) {
                    imgReel1_1.setPosition( imgReel1_1.x, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
                }
                if( imgReel1_2.y >= (Math.floor(KOMA/2)+4)*KOMA_HEIGHT ) {
                    imgReel1_2.setPosition( imgReel1_1.x, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
                }
            }
            if( flgMove2 || slip2>0 ) {
                imgReel2_1.setPosition( imgReel2_1.x, imgReel2_1.y+SPEED );
                imgReel2_2.setPosition( imgReel2_2.x, imgReel2_2.y+SPEED );
                slip2-=SPEED;
                if( imgReel2_1.y>=(Math.floor(KOMA/2)+4)*KOMA_HEIGHT ) {
                    imgReel2_1.setPosition( imgReel2_1.x, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
                }
                if( imgReel2_2.y>=(Math.floor(KOMA/2)+4)*KOMA_HEIGHT ) {
                    imgReel2_2.setPosition( imgReel2_1.x, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
                }
            }
            if( flgMove3 || slip3>0 ) {
                imgReel3_1.setPosition( imgReel3_1.x, imgReel3_1.y+SPEED );
                imgReel3_2.setPosition( imgReel3_2.x, imgReel3_2.y+SPEED );
                slip3-=SPEED;
                if( imgReel3_1.y>=(Math.floor(KOMA/2)+4)*KOMA_HEIGHT ) {
                    imgReel3_1.setPosition( imgReel3_1.x, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
                }
                if( imgReel3_2.y>=(Math.floor(KOMA/2)+4)*KOMA_HEIGHT ) {
                    imgReel3_2.setPosition( imgReel3_1.x, -(KOMA+(Math.floor(KOMA/2)-3))*KOMA_HEIGHT );
                }
            }
            if( flgAllStop === true ) {
                var pointing = app.pointing;
                point_x = pointing.x;
                point_y = pointing.y;
                
                // リールスタート
                if (pointing.getPointing() && point_y<200) {
                    
                    console.log("point_y : " + point_y);
                    console.log("point_x : " + point_x);

                    now = new Date().getTime();
                    dif = now - startTime;
                    console.log("now : " + now);
                    console.log("startTime : " + startTime);
                    console.log("dif : " + dif);
                    if(dif < WAIT_TIME) {
                        wait = WAIT_TIME-dif;
                        console.log("wait : " + wait);
                        sleep(wait);
                    } 
                    start();

                    startTime = new Date().getTime();
                    var prize = 0;
                    //start();
                    prize = getPrize();
                    // console.log("prize:" + prize);
                    chk1 = Math.floor((imgReel1_1.y-KOMA_HEIGHT/2)/KOMA_HEIGHT)+Math.floor(KOMA/2);
                    if( chk1<0 ) {
                        chk1+=KOMA;
                    }
                    if( chk1>=KOMA ) {
                        chk1-=KOMA;
                    }
                    chk1 = KOMA-chk1;

                    chk2 = Math.floor((imgReel2_1.y-KOMA_HEIGHT/2)/KOMA_HEIGHT)+Math.floor(KOMA/2);
                    if( chk2<0 ) {
                        chk2+=KOMA;
                    }
                    if( chk2>=KOMA ) {
                        chk2-=KOMA;
                    }
                    chk2 = KOMA-chk2;

                    chk3 = Math.floor((imgReel3_1.y-KOMA_HEIGHT/2)/KOMA_HEIGHT)+Math.floor(KOMA/2);
                    if( chk3<0 ) {
                        chk3+=KOMA;
                    }
                    if( chk3>=KOMA ) {
                        chk3-=KOMA;
                    }
                    chk3 = KOMA-chk3;
                }

            }

            // 停止フラグの確認
            if( !flgMove1 && !flgMove2 && !flgMove3 && slip1===0 && slip2===0 && slip3===0 ) {
                flgAllStop = true;
            }
        };     
    }
});   