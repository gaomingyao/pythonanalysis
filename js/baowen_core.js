/**
 * Created by gaomingyao on 2018/5/7.
 * 这个文件主要是处理报文的拼接 和上下跳的计算 拼好后等待create_baowen调用
 * 因为后加的begin 导致串行所以上下跳全部+1
 * tip 所有拼接的参数都需要时十六进制 并且是两位 不够补0
 * */
var modular=[];//存储模块号  暂时无用
var main_txt;//用户输入的文本 需要解析该python 解析成js的方法
var jump=0;//jump记录当前顺序 即行号
var save_baowen=[];//保存报文
var save_loop_for_limited_begin=[]; //存有限循环信息
var loop_for_limited_begin_times=0; //当前有限循环begin是第几次调用 和end做呼应
var save_loop_for_limited_end=[]; //存有限循环信息
var loop_for_limited_end_times=0; //当前有限循环end是第几次调用 和begin做呼应
var save_algorithm_relation_equal=[]; //等于运算
var need_updata=[];//记录条件语句的转折行 和 下一跳的值
var algorithm_relation_equal_times=0;//记录关系运算等于函数调用次数
/**
 * 系统类
 * begin(char mode)程序开始
 * end() 程序结束
 * ***/
//开始
function begin(){
    //mode 00:自平衡模式  01:自由控制模式
    var d1='A1';
    var d2='01';//mode  01自由控制
    var d3='0000000000000000';
    var d4='0'+String(0>>8);//上一跳高字节
    var d5='0'+String(0&255);//上一跳低字节
    var d6='0'+String(1>>8);//下一跳高字节
    var d7='0'+String(1&255);//下一跳低字节
    //生成报文
    var result= d1+d2+d3+d4+d5+d6+d7;
    //上下跳
    //当前下表为函数执行序号
    //开始的上一跳就是0 下一跳永远是1
    save_baowen[jump]=[result];
    //console.log(save_baowen[jump]);
    jump++;
}
//结束
function end(down_jump){
    var d1='A2';
    var d2='000000000000000000';
    var d3='0'+String(0>>8);//上一跳高字节
    var d4='0'+String(0&255);//上一跳低字节
    var d5=String(down_jump>>8).length > 1 ? parseInt(down_jump>>8).toString(16):'0'+String(down_jump>>8);//下一跳高字节判断长度大于1转16进制否则前面补0
    var d6=String(down_jump&255).length > 1 ? parseInt(down_jump&255).toString(16):'0'+String(down_jump&255);//下一跳低字节
    //判断十六进制之后的位数 如果是一位数则补0 这个问题主要出现在下一跳低字节  假设语句数小于255
    d6=d6.length>1?d6:'0'+d6;
    //生成报文
    var result= d1+d2+d3+d4+d5+d6;
    //上下跳
    //当前下表为函数执行序号
    //存储报文和上一跳序号 和如果纯在的下一跳序号
    save_baowen[jump]=[result];
    //console.log(save_baowen[jump]);
    //end之后应该有jump 归零等操作
}
/**
 * 赋值
 * assignment_value(char variable,int value)   把数值（value）赋值给变量（variable)
 * assignment_sensor(char variable,char sensor)   把传感器的值赋值给变量（variable)。
 * assignment_value2sensor(char sensor,char variable)   把变量（variable)的值赋值给传感器（sensor)。
 * assignment_sensor(char variable1,char variable2)   把变量variable2的值赋值给变量variable1。
 * assignment_slave_value(char variable,char mode)   从机配置 variable变量号 mode模式
 * */
//赋值 assignment_value(char variable,int value)   把数值（value）赋值给变量（variable)
function assignment_value(variable,value){
    var d1='A5';
    var d2='01';
    var d3='00';//变量名称 这里传索引 tip：这里暂时写死 默认的变量名称就是A 所以索引默认就是00了 需要将变量和索引的对应关系存入数组根据variable遍历出来索引
    var d4=String(value>>8).length > 1 ? parseInt(value>>8).toString(16):'0'+String(value>>8);//value高字节
    var d5=String(value&255).length > 1 ? parseInt(value&255).toString(16):'0'+String(value&255);//value低字节
    var d6='00';//value小数  小数点后面的数 假设为int 暂时为00
    var d7='00000000';
    var d8='0'+String(0>>8);//上一跳高字节
    var d9='0'+String(0&255);//上一跳低字节
    var d10=String((jump+1)>>8).length> 1 ? parseInt((jump+1)>>8).toString(16):'0'+String((jump+1)>>8);//下一跳高字节
    var d11=String((jump+1)&255).length> 1?parseInt((jump+1)&255).toString(16):'0'+String((jump+1)&255);//下一跳低字节
    var result=d1+d2+d3+d4+d5+d6+d7+d8+d9+d10+d11;
    //普通语句 上一跳为0 下一跳为当前序号  jump+1
    save_baowen[jump]=[result];
    jump++;
}
/**
 * 关系运算类
 * algorithm_relation_less(int value_A,int value_B)  小于运算 把 value_A 和value_B 的值做运算，结果为真（1）或者假（0）  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_relation_less_equal(int value_A,int value_B)  小于等于运算 把 value_A 和value_B 的值做运算，结果为真（1）或者假（0）  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_relation_greater(int value_A,int value_B)  大于运算 把 value_A 和value_B 的值做运算，结果为真（1）或者假（0）  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_relation_greater_equal(int value_A,int value_B)  大于等于运算 把 value_A 和value_B 的值做运算，结果为真（1）或者假（0）  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_relation_equal(int value_A,int value_B)  等于运算 把 value_A 和value_B 的值做运算，结果为真（1）或者假（0）  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_relation_unequal(int value_A,int value_B)  不等于运算 把 value_A 和value_B 的值做运算，结果为真（1）或者假（0）  。 value_A 和value_B 可以是下列任意组合。
 *  */
// 等于运算 把 value_A 和value_B 的值做运算，结果为真（1）或者假（0）  。 value_A 和value_B 可以是下列任意组合。
function algorithm_relation_equal(dengyu_value,dengyu_value_B,begin_row,in_row,turn_row){//3,2,4
    //begin_row开始行行号
    // in_row内部条数
    // turn_row转折行行号  转折行下一跳为   行号+全部条数
    //条件语句 特殊情况上跳为jump+2  下跳为jump+1
    var equal_begin_row=begin_row;
    var equal_in_row=in_row;
    //save_baowen[4];的最后一个字符串需要改为  begin_row+in_row+1的值
    var equal_turn_row=turn_row;
    var d1="A7";
    var d2="05";
    var d3="05";//默认是变量+值的形式
    var d4="000000";//这里传索引 tip：这里暂时写死 默认的变量名称就是A 所以索引默认就是00了 需要将变量和索引的对应关系存入数组根据variable遍历出来索引
    var d5=String(dengyu_value_B>>8).length > 1 ? parseInt(dengyu_value_B>>8).toString(16):'0'+String(dengyu_value_B>>8);//高字节依次是 高位 低位小数 这里小数默认为00
    var d6=String(dengyu_value_B&255).length > 1 ? parseInt(dengyu_value_B&255).toString(16):'0'+String(dengyu_value_B&255);//低字节;
    var d7="00";//小数(())
    var d8="00";
    var up_jump=turn_row+3;//上跳为转折行+2
    var down_jump=jump+1;//下跳为开始行+1
    var d9=String((up_jump)>>8).length> 1 ? parseInt((up_jump)>>8).toString(16):'0'+String((up_jump)>>8);//上一跳高字节
    var d10=String((up_jump)&255).length> 1?parseInt((up_jump)&255).toString(16):'0'+String((up_jump)&255);//上一跳低字节s
    var d11=String((down_jump)>>8).length> 1 ? parseInt((down_jump)>>8).toString(16):'0'+String((down_jump)>>8);//下一跳高字节
    var d12=String((down_jump)&255).length> 1?parseInt((down_jump)&255).toString(16):'0'+String((down_jump)&255);//下一跳低字节
    var result=d1+d2+d3+d4+d5+d6+d7+d8+d9+d10+d11+d12;
    save_baowen[jump]=[result];
    //show_arr(save_baowen[jump]);
    //强制修改下两条及jump+1和jump+2的下一跳为jump+3
    //Q1：怎么找到下两条？
    //Q2：嵌套怎么办？
    //记录调用次数
    //这里也是要存格式化好的值才行
    var if_update_order=equal_begin_row+equal_in_row+2;//算出的实际行号
    var update_gao=String((if_update_order)>>8).length> 1 ? parseInt((if_update_order)>>8).toString(16):'0'+String((if_update_order)>>8);
    var update_di=String((if_update_order)&255).length> 1 ? parseInt((if_update_order)&255).toString(16):'0'+String((if_update_order)&255);
    //判断十六进制之后的位数 如果是一位数则补0 这个问题主要出现在下一跳低字节  假设语句数小于255
    update_gao=update_gao.length>1?update_gao:'0'+update_gao;
    update_di=update_di.length>1?update_di:'0'+update_di;
    var if_update=update_gao+update_di;//拼起来
    /*need_updata[algorithm_relation_equal_times]=[equal_turn_row,equal_begin_row+equal_in_row+1];//第一个参数是要更改的jump 第二个是要更改的值*/
    need_updata[algorithm_relation_equal_times]=[equal_turn_row+1,if_update];//第一个参数是要更改的jump 第二个是要更改的值
    //console.log(save_baowen[jump]);
    jump++;
    algorithm_relation_equal_times++;//函数调用次数
}
/**
 * 特殊传感器类
 * rocker_control 摇杆控制
 * equip_motor_control(char speed,int dynamics,char library)      平衡控制指令   speed 表示速度  dynamics表示力度 library表示动作库号
 * equip_voice_control(char mode,char volume char library,char time)    语音控制指令  mode 表示功能  volume 表示音量 library表示语音库号 time录音时长
 * equip_voice_mid_control(char tone,char pitch,char midi,int time,int library)    mid控制指令  tone 表示音色和通道  pitch 表示音高 midi表示力度 time表示时间 library表示库号
 * equip_motor_alone_control(char motornum,char speed,int angle,char library)      单电机控制指令 motornum表示电机标号  speed 表示速度  angle表示角度 library表示动作库号
 * equip_count_control(char ID,char RESET,char variable,char uint)     计时器控制指令  ID表示计时器选择  RESET表示是否重置计时器  variable表示运行时间结果赋给variable uint控制计时器输出参数的单位
 * equip_motor_angle_control(char ID,char RESET,char variable,char uint)     角度传感器控制指令  ID表示端口选择  RESET表示是否重置  variable表示结果赋给variable uint输出参数的单位
 * */
//电机转动 equip_motor_alone_control(char motornum,char speed,int angle,char library)
// 单电机控制指令 motornum表示电机标号  speed 表示速度  angle表示角度 library表示动作库号
function equip_motor_alone_control(new_str){
    //普通语句 //上一跳为0 下一跳为行号jump+1
    var d1='2C';//type 2C白电机
    var d2=new_str;
    var d3='00';//value_type  0：speed、angle均为数值
    var d4='01';//wait_or_on 0-不等待 1-等待
    var d5='00';//sw 0-角度控制 1-时间控制
    var d6='0000';//两个站位的
    var d7='0'+String(0>>8);//上一跳高字节
    var d8='0'+String(0&255);//上一跳低字节
    var d9=String((jump+1)>>8).length> 1 ? parseInt((jump+1)>>8).toString(16):'0'+String((jump+1)>>8);//下一跳高字节
    var d10=String((jump+1)&255).length> 1?parseInt((jump+1)&255).toString(16):'0'+String((jump+1)&255);//下一跳低字节
    //判断十六进制之后的位数 如果是一位数则补0 这个问题主要出现在下一跳低字节  假设语句数小于255
    d10=d10.length>1?d10:'0'+d10;
    /*var other_result='0'+down_jump;*///暂时9+2模式 后两位为上跳下跳
    var result=d1+d2+d3+d4+d5+d6+d7+d8+d9+d10;
    save_baowen[jump]=[result];
    //console.log(save_baowen[jump]);
    jump++;
}
/**
 * 延时类
 * delay_100ms(int time)   时间基准100ms，time表示基准的倍数
 * delay_1s(int time)   时间基准1s，time表示基准的倍数
 * delay_1min(int time)   时间基准1min，time表示基准的倍数
 * */
function delay_1s(num){
    //普通语句 //上一跳为0 下一跳为行号jump+1
    var d1='A4';
    var d2='02';
    var d3=String(num>>8).length> 1 ? parseInt(num>>8).toString(16):'0'+String(num>>8);//time高字节
    var d4=String(num&255).length> 1?parseInt(num&255).toString(16):'0'+String(num&255);//time低字节
    var d5='00';//time低字节0:time为数值 1:time为变量
    var d6='0000000000';
    var d7='0'+String(jump>>8);//上一跳高字节
    var d8='0'+String(jump&255);//上一跳低字节 //延时的比较特殊上一跳是他自己 10以上的话需要补0
    //show_arr(d8);
    var d9=String((jump+1)>>8).length> 1 ? parseInt((jump+1)>>8).toString(16):'0'+String((jump+1)>>8);//下一跳高字节
    var d10=String((jump+1)&255).length> 1?parseInt((jump+1)&255).toString(16):'0'+String((jump+1)&255);//下一跳低字节
    //判断十六进制之后的位数 如果是一位数则补0 这个问题主要出现在下一跳低字节  假设语句数小于255
    d10=d10.length>1?d10:'0'+d10;
    //var down_jump=jump+1;
    //var other_result='0'+down_jump;//暂时9+2模式 后两位为上跳下跳
    var result=d1+d2+d3+d4+d5+d6+d7+d8+d9+d10;
    save_baowen[jump]=[result];
    //console.log(save_baowen[jump]);
    jump++;
}
/**
 * 循环类
 * loop_forever_begin();  无限循环开始
 * loop_forever_end();  无限循环结束
 * loop_for_limited_begin(int indexs)  有限循环开始
 * loop_for_limited_end()  有限循环结束
 * loop_for_time_begin(int time)  定时循环开始
 * loop_for_time_end()  定时循环结束
 * loop_break()  退出循环
 * */
//有限循环开始
function loop_for_limited_begin(times){
    //循环开始的上一跳为0 下一跳为jump+1
    var d1='A3';
    var d2='21';
    var d3=String(times>>8).length> 1 ? parseInt(times>>8).toString(16):'0'+String(times>>8);//time高字节
    var d4=String(times&255).length> 1?parseInt(times&255).toString(16):'0'+String(times&255);//time低字节
    var d5='00';//0:indexs为数值
    var d6='0000000000';
    var d7='0'+String(0>>8);//上一跳高字节
    var d8='0'+String(0&255);//上一跳低字节
    var d9=String((jump+1)>>8).length> 1 ? parseInt((jump+1)>>8).toString(16):'0'+String((jump+1)>>8);//下一跳高字节
    var d10=String((jump+1)&255).length> 1?parseInt((jump+1)&255).toString(16):'0'+String((jump+1)&255);//下一跳低字节
    var result=d1+d2+d3+d4+d5+d6+d7+d8+d9+d10;
    //下标为序列号
    save_loop_for_limited_begin[loop_for_limited_begin_times]=[jump,jump+1,loop_for_limited_begin_times+1];
    //上下跳
    //当前下表为函数执行序号
    //resule 为拼接的参数  上跳为0 下一跳为
    save_baowen[jump]=[result];
    jump++;
    loop_for_limited_begin_times++;
}
//有限循环结束        考虑情况 1.嵌套关系 2.并列关系
function loop_for_limited_end(order){
    //有限循环的结束为 循环开始的序号或者序号+1  下跳为序号jump+1
    //Q：怎么找到开始的循环的序号
    //A：找到save_loop_for_limited_begin[jump]  及为开始的调用序号等于结束的调用序号的倒叙（为嵌套准备）
    //根据那个号取出该end 对应的 开始的jump save_loop_for_limited_begin[jump]
    var d1='A3';
    var d2='A1';
    var d3='0000000000000000';
    save_loop_for_limited_end[loop_for_limited_end_times]=[order,jump,jump+1,loop_for_limited_end_times+1];
    //遍历循环开始  save_loop_for_limited_begin 找到loop_for_limited_begin_times中和save_loop_for_limited_end[jump][3]相等的 并返回jump 此序号及为jump
    //找到上跳 及循环开始时的行号
    var begin_times=save_loop_for_limited_begin.length-1-loop_for_limited_end_times;
    // console.log(begin_times);
    var up_jump=save_loop_for_limited_begin[begin_times][1];//算出此end对应的begin的序号
    var d4=String(up_jump>>8).length> 1 ? parseInt(up_jump>>8).toString(16):'0'+String(up_jump>>8);//上一跳高字节
    var d5=String(up_jump&255).length> 1?parseInt(up_jump&255).toString(16):'0'+String(up_jump&255);//上一跳低字节
    var d6=String((jump+1)>>8).length> 1 ? parseInt((jump+1)>>8).toString(16):'0'+String((jump+1)>>8);//下一跳高字节
    var d7=String((jump+1)&255).length> 1?parseInt((jump+1)&255).toString(16):'0'+String((jump+1)&255);//下一跳低字节
    //判断十六进制之后的位数 如果是一位数则补0 这个问题主要出现在下一跳低字节  假设语句数小于255
    d7=d7.length>1?d7:'0'+d7;
    /*var other_result=String(up_jump)+down_jump;*/
    var result=d1+d2+d3+d4+d5+d6+d7;
    save_baowen[jump]=[result];
    //console.log(save_loop_for_limited_end);
    //console.log(save_loop_for_limited_begin);
    //console.log(up_jump);
    //console.log(save_baowen[jump]);
    jump++;
    loop_for_limited_end_times++;
}
/**
 * 算术逻辑运算类
 * algorithm_arithmetic_add(int value_A,int value_B,char result_C)  加法运算 把 value_A 和value_B 的值做运算，结果给 result_C  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_arithmetic_sub(int value_A,int value_B,char result_C)  减法运算 把 value_A 和value_B 的值做运算，结果给 result_C  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_arithmetic_multiply(int value_A,int value_B,char result_C)  乘法运算 把 value_A 和value_B 的值做运算，结果给 result_C  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_arithmetic_division(int value_A,int value_B,char result_C)  除法运算 把 value_A 和value_B 的值做运算，结果给 result_C  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_arithmetic_remainder(int value_A,int value_B,char result_C)  求余运算 把 value_A 和value_B 的值做运算，结果给 result_C  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_arithmetic_increment(char result_C)  自增运算 把result_C 的值做运算，结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_decrement(char result_C)  自减运算 把result_C 的值做运算，结果给 result_C  。 注意：result_C仅指变量
 * algorithm_logic_and(int value_A,int value_B,char result_C)  逻辑与运算 把 value_A 和value_B 的值做运算，结果给 result_C  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_logic_or(int value_A,int value_B,char result_C)  逻辑或运算 把 value_A 和value_B 的值做运算，结果给 result_C  。 value_A 和value_B 可以是下列任意组合。
 * algorithm_logic_non(int value_A,char result_C)  逻辑非运算  对value_A进行逻辑非运算，结果给 result_C
 * */
//自增
function algorithm_arithmetic_increment(zizeng_result){
    var d1='A6';
    var d2='06';
    var d3='00';//传索引？？
    var d4='00000000000000';
    //普通语句上下跳通用算法
    var d5='0'+String(0>>8);//上一跳高字节
    var d6='0'+String(0&255);//上一跳低字节
    var d7=String((jump+1)>>8).length> 1 ? parseInt((jump+1)>>8).toString(16):'0'+String((jump+1)>>8);//下一跳高字节
    var d8=String((jump+1)&255).length> 1? parseInt((jump+1)&255).toString(16):'0'+String((jump+1)&255);//下一跳低字节
    //判断十六进制之后的位数 如果是一位数则补0 这个问题主要出现在下一跳低字节  假设语句数小于255
    d8=d8.length>1 ? d8 : '0'+d8;
    var result=d1+d2+d3+d4+d5+d6+d7+d8;
    save_baowen[jump]=[result];
    //console.log(save_baowen[jump]);
    jump++;
}
/**
 * 三角函数类
 * algorithm_arithmetic_sin(int value_A,char result_C)  正弦运算 把value_A做正弦运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_cos(int value_A,char result_C)  余弦运算 把value_A做正弦运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_tan(int value_A,char result_C)  正切运算 把value_A做正弦运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_asin(int value_A,char result_C)  反正弦运算 把value_A做反正弦运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_acos(int value_A,char result_C)  反余弦运算 把value_A做反余弦运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_atan(int value_A,char result_C)  反正切运算 把value_A做反正切运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_sinh(int value_A,char result_C)  双曲正弦运算 把value_A做双曲正弦运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_cosh(int value_A,char result_C)  双曲余弦运算 把value_A做双曲余弦运算的结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_tanh(int value_A,char result_C)  双曲正切运算 把value_A做双曲正切运算的结果给 result_C  。 注意：result_C仅指变量
 * */
/*****
 * 一般函数
 * algorithm_arithmetic_fabs(int value_A,char result_C)  绝对值运算 把value_A的绝对值结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_sqrt(int value_A,char result_C)  平方根运算 把value_A的平方根结果给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_round(int value_A,char result_C)  随机数 产生小于value_A的随机数字，赋值给 result_C  。 注意：result_C仅指变量
 * algorithm_arithmetic_round(int value_A,int value_B,char result_C)  随机数 产生value_A和value_B之间的随机数字，赋值给 result_C  。 注意：result_C仅指变量
 * */
/**
 * 开关类
 * enable(int name，char num) 使能某个功能   name表示手机，语音，手势等  num表示注册号或者序号
 * disable(int name，char num) 失能某个功能   name表示手机，语音，手势等  num表示注册号或者序号
 * */
/**
 * 输入传感器类
 * 模板卡牌中，首字节为类型，第2个字节为序号
 * 一般卡牌中，首字节为注册号,第2个字节位子类别;无特殊说明，num为0
 * equip_sensor_get()
 * */
/**
 * 输出传感器类
 * equip_lcd_basic_control(char num,char area,char bit int library)   lcd 控制指令  num表示序号或子类别 area表示区码 bit 表示位码  library表示库
 * equip_lcd_special_control(char num,char x,char y,char stat，char char x,char y,char stat)   lcd 控制指令（用于用户自己定义的图形）  num表示序号或子类别 x表示横坐标即行号 y 表示纵坐标即列号 stat表示状态即亮或灭
 * equip_motorhub_control() 电机hub控制指令 num表示序号或子类别 motornum表示电机hub的端口号
 * equip_sensor_control(char type,char num,char d2,char d1,char d0,char library)    通用输出传感器控制指令  type传感器类型 num表示序号或子类别   d2表示有符号型高字节 d1表示有符号型低字节 d0有符号型小数   library表示库号
 * equip_board_control(char type,char num,char d2,char d1,char d0,char library)   开发板输出传感器控制指令  type传感器类型 num表示序号或子类别   d2表示有符号型高字节 d1表示有符号型低字节 d0有符号型小数   library表示库号
 * */



