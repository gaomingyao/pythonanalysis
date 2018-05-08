/**
 * Created by gaomingyao on 2018/5/7.
 * 处理用户所输入的字符串 即处理python文本 将最终拼好的数组交付给create_baowen.js处理
 */
function do_main(){
    //用来存新的分类好的数组
    var new_arr=[];
    //获取用户输入的python字符串
    main_txt=document.getElementById('main_txt').value;
    //通过换行分割为数组
    main_txt=main_txt.split("\n");
    //调用预处理 返回去掉空白行和注释的数组
    main_txt=preprocessing(main_txt);

    /**
     * 按行分割后 处理每一行 封装成数组交给create_baowen.js处理
     * 遍历数组根据关键字和特征识别意义
     * 每当有需要解析的python 语句在这里扩展即可
     * */
    //处理赋值语句
    handel_assignment(new_arr);
    //处理while关键字
    handel_while(new_arr);
    //处理if关键字
    handel_if(new_arr);
    //处理whilend无需特殊处理
    handel_whilend(new_arr);
    //处理aq语句
    handel_aq(new_arr);
    //处理sleep语句   获取行号 和方法名称
    handel_sleep(new_arr);
    //处理自增运算
    handel_zizeng(new_arr);
    //调用执行函数生成报文
    create_baowen(new_arr);
    //show_arr(new_arr)
}
//处理if关键字
function handel_if(new_arr){
    /**
     * 处理if语句
     * 对有关键字if的语句进行处理 分解语句找到参数
     * 计算转折行和结束行
     * find_if 开始行  ？？？？好像不太对
     * if_end_row结束行
     * transition_row转折行
     * */
    var if_parent='';
    var get_fuhao=[];
    //遍历大数组
    for(var find_if=0;find_if<main_txt.length;find_if++){
        //找到有if的语句
        if(main_txt[find_if].indexOf('if')!=-1){
            //记录if前的空格数量 用缩进分割成数组 看长度 数组成都-1就是空格组数
            var space_num=(main_txt[find_if].split('    ')).length-1;
            //判断是否有父亲 这个暂时也没啥用
            if(main_txt[find_if].indexOf('    ') == -1){
                //没空格说明没父亲
                if_parent=null;
            }else{
                //有父亲 算出父亲行号 暂时不算暂时写死
                if_parent=2;
            }
            //去掉空格 if 和冒号和空格
            main_txt[find_if]=main_txt[find_if].replace(/if/g,'').replace(/:/g,'').replace(/ /g,'');
            //判断符号是什么 获取if中的条件是什么
            var all_fuhao=['<','>','==','<=','>='];
            //找if中的符号
            for(var fuhao=0;fuhao<all_fuhao.length;fuhao++){
                if( main_txt[find_if].indexOf(all_fuhao[fuhao])!=-1){
                    get_fuhao[find_if]=all_fuhao[fuhao];//获取到了符号跳出函数
                    break;
                }
            }
            //根据上方算出的符号分割该if字符串 找到变量和值
            var single_arr_if=main_txt[find_if].split(get_fuhao[find_if]);
            //还需计算转折行和结束行transition_row  end_row
            var transition_row;//转折行
            var if_end_row;//结束行
            //算出该if结束行 从这行开始遍历找到第一个没'    '的行号-1  space_num为组数
            var space=['','    ','        ','            '];//根据组数查询空格数量
            //从当前行开始遍历 遍历到结束
            for(var end_row=find_if+1;end_row<main_txt.length; end_row++){
                //if(main_txt[end_row].indexOf(space[space_num-1]) != -1){
                //考虑在不在循环内外
                if(space_num==0){//无空格则是在自己就是最外层
                    // 也从当前行的下一行开始遍历 结束行为第一个无空格行-1
                    for(var get_boss_if_end=end_row+1;get_boss_if_end<main_txt.length; get_boss_if_end++){
                        //第一个else并且有四个空格就是转折行
                        if(main_txt[get_boss_if_end].indexOf('else')!=-1 && main_txt[get_boss_if_end].indexOf('    ')==-1){
                            //转折行就是这行else行号-1
                            transition_row=get_boss_if_end-1;
                        }
                        //找到第一个无'    '的行号并且非else 就是结束行（因为这个就是最外层）
                        if(main_txt[get_boss_if_end].indexOf('    ')==-1 && main_txt[get_boss_if_end].indexOf('else')==-1){
                            if_end_row=get_boss_if_end-1;
                            break;
                        }else{
                            //新增一种情况if后面无语句了 找不到
                            if_end_row=main_txt.length-1;
                        }
                    }
                }else{
                    //若前面有空格则是在循环内
                    //下面判断值考虑内嵌一层的情况
                    if(main_txt[end_row].indexOf(space[space_num-1]) != -1 && main_txt[end_row].indexOf(space[space_num+1]) == -1){
                        //如果有else并且由于是内嵌的前面必须有空格
                        if(main_txt[end_row].indexOf('else')!=-1 && main_txt[end_row].indexOf('    ')!=-1){//无else
                            //转折行
                            transition_row=end_row-1;
                        }
                        //由于是内嵌 结束行没else并且有 ‘    ’
                        if(main_txt[end_row].indexOf('else')==-1 && main_txt[end_row].indexOf('    ')!=-1){//无else
                            if_end_row=end_row-1;
                            break;
                        }
                    }
                }
            }
            //找到if语句后第一个统计else
            //暂时先当做等于  根据get_fuhao获取符号调用相应方法
            new_arr[find_if]=[find_if,'algorithm_relation_equal',get_fuhao[find_if],single_arr_if[0],single_arr_if[1],if_parent,space_num,if_end_row,transition_row];//[行号，方法名称,符号,变量，值,父亲行号,前面空格组数，结束行,转折行]（第一个行号也是if的开始行）
        }
    }
    //处理else else无需特殊处理只需标记行号即可************************************************************************************************
    for(var find_else=0;find_else<main_txt.length;find_else++){
        if(main_txt[find_else].indexOf('else')!=-1){
            new_arr[find_else]=[find_else,'else'];//[行号，字符串else]
        }
    }
}
//处理赋值
function handel_assignment(new_arr){
    /**
     * 处理赋值 assignment
     * 特征：运算符只有等号再无其他可认定为赋值
     * 遍历数组 有等号 无if,while,for,+,-,*./等  可根据开发继续添加排除符号
     * */
    for(var m=0;m<main_txt.length;m++){
        if(main_txt[m].indexOf('=')!=-1 && main_txt[m].indexOf('if')==-1 && main_txt[m].indexOf('while')==-1 && main_txt[m].indexOf('for')==-1 && main_txt[m].indexOf('+')==-1 && main_txt[m].indexOf('-')==-1 && main_txt[m].indexOf('*')==-1 && main_txt[m].indexOf('/')==-1){
            //show_arr(main_txt[m]);
            //因为赋值只有= 所以格局=分割 分割前去掉空格
            var single_arr_fuzhi=main_txt[m].replace(/ /g,'').split("=");
            //拼装数组 添加模块
            new_arr[m]=[m,'assignment_value',single_arr_fuzhi[0],single_arr_fuzhi[1]];//[行号，方法名称,变量，值]
        }
    }
}
//处理while关键字
function handel_while(new_arr){
    /**
     * 处理while循环
     * 特征：有关键字while有限循环
     * while比较特殊  A:循环不可用  需要判断缩进
     * */
    var while_end_row;
    for(var w=0;w<main_txt.length;w++){
        if(main_txt[w].indexOf('while')!=-1 && main_txt[w].indexOf('whilend')==-1){
            var while_space=['    ','        ','            '];
            //通过缩进计算while内嵌关系 暂时无用 做嵌套时使用
            var while_space_num=(main_txt[w].split('    ')).length-1;
            //正则算出循环次数
            var single_arr_while=main_txt[w].match("\\((.+?)\\)");
            //算出该while结束行 从这行开始遍历找到第一个没'    '的行号-1
            if(main_txt[w].indexOf('    ')==-1){
                //如果while为最外层则没问题否则var while_space=['','    ','        ','            '];//根据组数查询空格数量
                for(var w_row=w+1;w_row<main_txt.length; w_row++){
                    if(main_txt[w_row].indexOf('    ') == -1 && main_txt[w_row].indexOf('whilend') != -1){
                        while_end_row=w_row;
                        break;
                    }
                }
            }else{//这里的while是嵌套的需要处理 //先假设只是一层while前只有一一组‘    ’
                //找到下一个非else的行
                for(var while_in_row=w+1;while_in_row<main_txt.length;while_in_row++){
                    if(main_txt[while_in_row].indexOf('else')==-1 && main_txt[while_in_row].indexOf('whilend')!=-1 && main_txt[while_in_row].indexOf('    ')!=-1){//一组空格开头并且不是else
                        while_end_row=while_in_row;
                        break;
                    }
                }
            }
            /* //判断有没有父亲  判断当前while是否有'    '   //  暂时没写先写简单的
             if(main_txt[w].indexOf('    ') == -1){
             //没空格说明没父亲
             }else{
             //说明有父亲
             }*/
            new_arr[w]=[w,'loop_for_limited_begin',single_arr_while[1].replace(/ /g,''),while_end_row];//[行号，方法名称,循环次数,结束行]
        }
    }
}
//处理whilend
function handel_whilend(new_arr){
    /**
     * 处理whilend
     * 特征：whilend关键字
     * 并列情况不可以 需要修改逻辑
     * */
    for(var find_whilend=0;find_whilend<main_txt.length;find_whilend++){

        if(main_txt[find_whilend].indexOf('whilend')!=-1){
            for(var whilend_begin=0;whilend_begin<main_txt.length;whilend_begin++) {
                if (new_arr[whilend_begin][1] == 'loop_for_limited_begin' && new_arr[whilend_begin][3]== find_whilend) {
                    var whilend_begin_row = new_arr[whilend_begin][0];
                    break;
                }
            }
            new_arr[find_whilend]=[find_whilend,'whilend',whilend_begin_row];//[行号，字符串else,结束行]
        }

    }
}
//处理aq
function handel_aq(new_arr){
    for(var find_aq_fun=0;find_aq_fun<main_txt.length;find_aq_fun++){
        if(main_txt[find_aq_fun].indexOf('aq.')!=-1){
            var fun_all_name=main_txt[find_aq_fun].replace(/aq./g,'').replace(/ /g,'');
            var fun_name=fun_all_name.split('(')[0];
            var parameter=main_txt[find_aq_fun].replace(/ /g,'').match("\\((.+?)\\)")[1];
            new_arr[find_aq_fun]=[find_aq_fun,fun_name,fun_all_name,parameter];//[行号，方法名称，方法全部字符,参数]
        }
    }
}
//处理延时语句
function handel_sleep(new_arr){
    for(var find_sleep_fun=0;find_sleep_fun<main_txt.length;find_sleep_fun++){
        if(main_txt[find_sleep_fun].indexOf('sleep')!=-1){
            var sleep_times=main_txt[find_sleep_fun].replace(/ /g,'').match("\\((.+?)\\)");
            new_arr[find_sleep_fun]=[find_sleep_fun,'sleep',sleep_times[1]];//[行号，字符串sleep,睡眠时间]
        }
    }
}
//处理自增语句
function handel_zizeng(new_arr){
    for(var find_zizeng_fun=0;find_zizeng_fun<main_txt.length;find_zizeng_fun++){
        if(main_txt[find_zizeng_fun].indexOf('++')!=-1){
            var zizeng=main_txt[find_zizeng_fun].replace(/ /g,'').split('++');
            //show_arr(zizeng[0]/*变量名称*/);//因为有begin了所以占了一行
            new_arr[find_zizeng_fun]=[find_zizeng_fun+1,'algorithm_arithmetic_increment',zizeng[0]];//[行号，字符串sleep,变量名称]
        }
    }
}
//计算模块号 暂时用不上 嵌套并列情况可能会用上
function handel_modular(new_arr){
    //遍历数组根据空格分出模块号 暂时不考虑模块号 暂时作废注释掉
    for(var j=0;j<main_txt.length;j++){
        if(main_txt[j].indexOf('    ') == -1){
         //show_arr(main_txt[j]);
         modular.push(j);//modular数组这是存的是模块开始的行数
        }
        }
        //show_arr(modular);//模块的开始行号[0, 1, 2, 7]
        //结束行号为数组下一位行号-1
        //A：怎么找到结束行 结束行为下一模块开始行号-1
        for(var k=0;k<modular.length;k++){
            if(modular[k]){
                if(!isNaN(String(modular[k+1]-1))){
                    //非最后模块
                    //拼接  模块号.开始行.结束行
                    modular[k]=String(k)+'.'+String(modular[k])+'.'+String(modular[k+1]-1)
                }else{
                    //最后一个模块的结束行为整个数组的长度
                    modular[k]=String(k)+'.'+String(modular[k])+'.'+String(main_txt.length)
                }
            }
        }
}
//预处理 去除空白行和注释
function preprocessing(arr){
    var j=0;
    var new_arr=[];
    for(var i=0;i<arr.length;i++){
        if(arr[i]!='' && arr[i].indexOf('#')==-1 ){
            new_arr[j]=arr[i];
            j++
        }
    }
    return new_arr;
}
//打印
function show_arr(e){
    console.log(e)
}