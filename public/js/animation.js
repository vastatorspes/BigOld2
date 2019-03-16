function getId(x, thisId){
    var flag = thisId.substring(0,1);
    var id = thisId.substring(1,thisId.length - 3);
    var select = thisId.substring(thisId.length - 3, thisId.length);

    // alert(`flag = ${flag}, id = ${id}, select = ${select}`);
    // alert(thisId);
    if(flag === "F"){
        if(select === "NON"){
            x.style.margin = "-15px 0px 0px 0px"
            x.id = flag+id+"SEL";
            $(x).addClass("SEL");
        }
        else{
            x.style.margin ="0px"
            x.id = flag+id+"NON";
            $(x).removeClass("SEL");
        }
    }
    
    if(flag === "L"){
        if(select === "NON"){
            x.style.margin = "-15px 0px 0px -60px";
            x.id = flag+id+"SEL";
            $(x).addClass("SEL");
        }
        else{
            x.style.margin ="0px 0px 0px -60px";
            x.id = flag+id+"NON";
            $(x).removeClass("SEL");
        }
    }
}

