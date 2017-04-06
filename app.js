import React, {Component } from "react";
import {View,Text,StyleSheet,ActivityIndicator, Platform,ListView,Keyboard,AsyncStorage } from "react-native";
import Header from "./header";
import Footer from "./footer";
import Row from "./row";
const filterItems=(filter,items)=>{
  return items.filter((item)=>{
    if(filter=="ALL") return true;
    if(filter=="ACTIVE") return !item.complete;
    if(filter=="COMPLETE") return item.complete;
  })
}
class App extends Component{
  constructor(props){
    super(props);
    const ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 != r2});
    this.state={
      loading:true,
      allComplete:false,
      filter:"ALL",
      value:"",
      items:[],
      dataSource:ds.cloneWithRows([])
    }
    this.setSource=this.setSource.bind(this);
    this.handleToggleComplete=this.handleToggleComplete.bind(this);
    this.handleRemoveItem=this.handleRemoveItem.bind(this);
    this.handleToggleAllComplete=this.handleToggleAllComplete.bind(this);
    this.handleAddItem=this.handleAddItem.bind(this);
    this.handleFilter=this.handleFilter.bind(this);
    this.handleClearComplete=this.handleClearComplete.bind(this);
    this.handleToggleEditing=this.handleToggleEditing.bind(this);
    this.handleUpdateText=this.handleUpdateText.bind(this);

  }
  componentWillMount(){
    AsyncStorage.getItem("items").then((json)=>{
      try{
        const items = JSON.parse(json);
        this.setSource(items,items,{loading:false});
      }catch(e){
        this.setState({
          loading:false
        })
      }
    })
  }
  setSource(items,itemDatasource,otherState={}){
    this.setState({
      items,
      dataSource:this.state.dataSource.cloneWithRows(itemDatasource),
      ... otherState
    })
    AsyncStorage.setItem("items", JSON.stringify(items));

  }
  handleUpdateText(key,text){
    const newItems=this.state.items.map((item)=>{
      if(item.key!=key) return;
      return{
        ...item,
        text
      }
    })
    this.setSource(newItems,filterItems(this.state.filter, newItems));
  }
  handleToggleEditing(key,editing){
    const newItems=this.state.items.map((item)=>{
      if(item.key!=key) return;
      return{
        ...item,
        editing
      }
    })
    this.setSource(newItems,filterItems(this.state.filter, newItems));
  }
  handleClearComplete(){
    const newItems=filterItems("ACTIVE",this.state.items);
    this.setSource(newItems,filterItems(this.state.filter,newItems));

  }
  handleFilter(filter){
    this.setSource(this.state.items,filterItems(filter,this.state.items));
  }
  handleRemoveItem(key){
    const newItems=this.state.items.filter((item)=>{
      return item.key != key
    })
    this.setSource(newItems,filterItems(this.state.filter,newItems));
  }
  handleToggleComplete(key,complete){
    const newItems=this.state.items.map((item)=>{
      if(item.key != key) return item;
      return {
        ... item,
        complete,
      }
    })
    this.setSource(newItems,filterItems(this.state.filter,newItems))
  }
  handleToggleAllComplete(){
    const complete = !this.state.allComplete;
    const newItems= this.state.items.map((item)=>({
      ... item,
      complete
    }))
      console.table(newItems);
    this.setSource(newItems,filterItems(this.state.filter,newItems),{ allComplete:complete})
    // this.setState({
    //   items:newItems,
    //   allComplete:complete
    // })
  }
  handleAddItem(){
    if(!this.state.value) return;
    const newItems=[
      ... this.state.items,
      {
        key:Date.now(),
        text:this.state.value,
        complete:false
      }
    ]
    this.setSource(newItems,filterItems(this.state.filter,newItems),{value:""})
    // this.setState({
    //   items:newItems,
    //   value:""
    // })
  }
  render() {
    return(
      <View style={styles.container}>
        <Header
          value={this.state.value}
          onAddItem={this.handleAddItem}
          onChange={(value)=>this.setState({value})}
          onToggleAllComplete={this.handleToggleAllComplete}
        />
          <View style={styles.content}>
            <ListView
              style={styles.list}
              enableEmptySections
              dataSource={this.state.dataSource}
              onScroll={()=>Keyboard.dismiss()}
              renderRow={({ key,...value})=>{
                return (
                  <Row
                    key={key}
                    onUpdate={(text)=>this.handleUpdateText(key,text)}
                    onToggleEdit={(editing)=>this.handleToggleEditing(key,editing)}
                    onComplete={(complete)=>this.handleToggleComplete(key,complete)}
                    {...value}
                    onRemove={()=>this.handleRemoveItem(key)}
                  />
                )
              }}
              renderSeperator={(sectionId,rowId)=>{
                return <View key={rowId} style={styles.seperator}/>
              }}
            />
          </View>
        <Footer
        actCount={filterItems("ACTIVE",this.state.items).length}
        comCount={filterItems("COMPLETE",this.state.items).length}
        filter={this.state.filter}
        onFilter={this.handleFilter}
        onClearComplete={this.handleClearComplete}
        />
        {this.state.loading &&  <View style={styles.loading}>
        <ActivityIndicator
          animating
          size="large"
        />
        </View>}
      </View>
    );
  }
}
const styles=StyleSheet.create({
  container:{
    flex : 1,
    backgroundColor:"#f5f5f5",
    ... Platform.select({
      android:{
        paddingTop:30
      }
    })
  },
  loading:{
    position:"absolute",
    left:0,
    top:0,
    right:0,
    bottom:0,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"rgba(0,0,0, .2)"

  },
  content:{
    flex:1
  },
  list:{
    backgroundColor:"#FFF"
  },
  seperator:{
    borderWidth:1,
    borderColor:"#f5f5f5"
  }

});

export default App;
