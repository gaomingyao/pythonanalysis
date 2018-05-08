/**
 * Created by gaomingyao on 2018/5/7.
 * 创建报文
 * 由于用户输入的没有开始和结束需要自己补 但是会导致上下跳串行 自行测试+1就可以解决
 * new_arr[k][0]固定为行号
 * new_arr[k][1]固定为名称
 * 每当需要扩展一条报文都要在这里加上调用
 */
//创建报文
function create_baowen(new_arr){
    begin();//默认有的直接调
    //遍历数组根据new_arr[1]的名称调用相应方法
    for(var k=0;k<new_arr.length;k++){
        switch(new_arr[k][1])
        {
            case "loop_for_limited_begin"://有限循环开始
                loop_for_limited_begin(new_arr[k][2]);
                break;
            case 'sleep'://延时
                delay_1s(new_arr[k][2]);
                break;
            case 'else'://延时  由于else硬件方面没提供接口 为了不串行 用延时代替 其实没有下一跳会跳到这里 经试验可行
                delay_1s(1);
                break;
            case 'equip_motor_alone_control'://操纵电机
                var new_str=new_arr[k][3].replace(/"/g,'').replace(/'/g,'');
                var angle_arr=new_str.split(',');
                //将参数在这里转十六进制 也可以 在baowen_core.js中转和拼接 推荐后者可完全分离 这里只进行python解析的参数的处理
                var angle_gao=String(angle_arr[1]).length > 1 ? parseInt(angle_arr[1]).toString(16):'0'+String(angle_arr[1]);
                var angle_gao2=String(angle_arr[2]>>8).length > 1 ?parseInt(angle_arr[2]>>8).toString(16):'0'+String(angle_arr[2]>>8);
                var angle_di2=String(angle_arr[2]&255).length > 1 ?parseInt(angle_arr[2]&255).toString(16):'0'+String(angle_arr[2]&255);
                new_str=angle_arr[0]+angle_gao+String(angle_gao2)+String(angle_di2);
                equip_motor_alone_control(new_str);
                break;
            case 'assignment_value'://赋值
                var variable=new_arr[k][2];//变量名称
                var value=new_arr[k][3];  //变量值
                assignment_value(variable,value);
                break;
            case'algorithm_relation_equal'://if 等于
                var dengyu_value=new_arr[k][3];//变量名称
                var dengyu_value_B=new_arr[k][4];//变量值
                var begin_row=new_arr[k][0];//if开始行
                var in_row=new_arr[k][7]-new_arr[k][0];//if中语句数量 不含if
                var turn_row=new_arr[k][8];//转折行 else上一条行号
                algorithm_relation_equal(dengyu_value,dengyu_value_B,begin_row,in_row,turn_row);//参数依次为 变量 值 if开始行 占行数 转折行
                break;
            case 'algorithm_arithmetic_increment'://自增
                var zizeng_result=new_arr[k][2];//变量名称
                algorithm_arithmetic_increment(zizeng_result);
                break;
            case 'whilend':
                loop_for_limited_end();
                break;
            default:

        }
    }
    end(new_arr.length+1);//默认有的直接调
    //更新if上下跳
    update_if();
    //前端打印
    show_index()
}
//修改转折行  遍历所有报文 由于if及其内部的上下跳比较特殊 在报文生成后修改 否则可能会串行
function update_if(){
    for(var i=0;i<save_baowen.length;i++){
        //need_updata 内存储的需要修改的行号和需要修改的值（已经转为十六进制）
        for(var j=0;j<need_updata.length;j++){
            if(i==need_updata[j][0]){
                //修改相应的行号的后四位
                save_baowen[i][0]=save_baowen[i][0].substr(0,save_baowen[i][0].length-4)+need_updata[j][1];
            }
        }
    }
}
function show_index(){
    //在页面商法打印 save_baowen数组就是最终结果
    for(var m=0;m<save_baowen.length;m++){
        var baowen = document.getElementById('baowen');//通过id获取div节点对象
        baowen.innerHTML = baowen.innerHTML +save_baowen[m][0]+'<br>';//在div中追加内容22323
    }
}
