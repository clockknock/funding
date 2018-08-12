pragma solidity ^0.4.24;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract FundingFactory {

    //存储所有已经部署的智能合约的地址
    address[] public fundings;

    function deploy(string _projectName, uint _supportMoney, uint _goalMoney) public {
        address funding = new Funding(_projectName, _supportMoney, _goalMoney, msg.sender);
        fundings.push(funding);
    }

    function getFundings() public view returns (address[])  {
        return fundings;
    }
}

contract Funding is usingOraclize {
    //众筹发起人地址(众筹发起人)
    address private manager;
    //项目名称
    string private projectName;
    //众筹参与人需要付的钱
    uint private supportMoney;
    // 众筹结束的时间
    uint private endTime;
    // 目标募集的资金(endTime后,达不到目标则众筹失败)
    uint private goalMoney;
    bool isFundingSuccess;
    // 众筹参与人的数组
    address[] private players;
    mapping(address => bool) public playersMap;
    //众筹是否完成
    bool public isComplete;

    //合约到期时间
    uint fundingLimitTime = 15 minutes;

    //付款请求申请的数组(由众筹发起人申请)
    Request[] public requests;

    // 返回参与人的数量
    function getPlayersCount() public view returns (uint){
        return players.length;
    }

    function getPlayers() public view returns (address[]){
        return players;
    }

    //获取当前合约的余额
    function getTotalBalance() public view returns (uint){
        return address(this).balance;
    }

    function getRemainSecond() public view returns (uint){
        //如果当前时间大于过期时间,则说明超时了,返回0
        if (now > endTime) {
            return 0;
        }
        return (endTime - now);
    }

    function getSupportMoney() public view returns (uint){
        return supportMoney;
    }

    function getManager() public view returns (address){
        return manager;
    }

    function getProjectName() public view returns (string){
        return projectName;
    }

    function getGoalMoney() public view returns (uint){
        return goalMoney;
    }

    function getRequestSize() public view returns (uint){
        return requests.length;
    }

    function getIsFundingSuccess() public view returns (bool){
        return isFundingSuccess;
    }

    // 付款请求的结构体
    struct Request {
        string description; //为什么要付款
        uint money; //花多少钱
        address shopAddress; //卖家的钱包地址
        bool complete;  //付款是否已经完成
        mapping(address => bool) votedMap; //哪些已经投过票的人
        uint voteCount; // 投票的总的总数
    }

    function getRequestDescriptionAt(uint index) public view returns (string){
        return requests[index].description;
    }

    function getRequestMoneyAt(uint index) public view returns (uint){
        return requests[index].money;
    }

    function getRequestShopAddressAt(uint index) public view returns (address){
        return requests[index].shopAddress;
    }

    function getRequestCompleteAt(uint index) public view returns (bool){
        return requests[index].complete;
    }

    function getRequestVoteCountAt(uint index) public view returns (uint){
        return requests[index].voteCount;
    }

    function isVotedAt(uint index, address _addr) public view returns (bool){
        return requests[index].votedMap[_addr];
    }

    //  构造函数
    constructor(string _projectName, uint _supportMoney, uint _goalMoney, address _address) payable public{
        manager = _address;
        projectName = _projectName;
        supportMoney = _supportMoney;
        goalMoney = _goalMoney;
        endTime = now + fundingLimitTime;
        //在合约创建的时候发起定时任务
        updateIsComplete();
    }

    //updateIsComplete触发的回调函数
    function __callback(bytes32 myid, string result) public {
        isComplete = true;
        if (address(this).balance > getGoalMoney()) {
            isFundingSuccess = true;
        }
    }

    //发起一个定时任务更新isComplete field
    function updateIsComplete() public payable {
        oraclize_query(fundingLimitTime, "URL",
            "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last");
    }

    //创建用款请求
    function createRequest(string _description, uint _money, address _shopAddress) public onlyManagerCanCall {
        Request memory request = Request({
            description : _description,
            money : _money,
            shopAddress : _shopAddress,
            complete : false,
            voteCount : 0
            });
        requests.push(request);
    }

    //  众筹参与人员批准某一笔付款 ( index数组的下标 )
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        //1.  检查某个人是否已经在众筹参与人列表里面
        require(playersMap[msg.sender]);
        //2 .检查某个人是不是已经投过票了
        require(!requests[index].votedMap[msg.sender]);
        request.voteCount ++;
        requests[index].votedMap[msg.sender] = true;
    }

    //众筹发起人调用, 可以调用完成付款, index:下标
    function finalizeRequest(uint index) public onlyManagerCanCall {
        Request storage request = requests[index];
        // 付款必须是未完成的
        require(!request.complete);
        //  至少一半以上的参与者同意付款
        require(request.voteCount * 2 > players.length);
        // 打钱转账
        require(address(this).balance >= request.money);
        request.shopAddress.transfer(request.money);
        request.complete = true;
    }

    //是否是支持者
    function isSupporter(address _addr) public view returns (bool){
        return playersMap[_addr];
    }

    //发起交易的人支持众筹
    function support() public needIsComplete payable {
        //需要众筹成功才能支持,避免捐款逃跑
        require(isFundingSuccess);
        //没支持过才能支持
        require(!playersMap[msg.sender]);
        require(msg.value == supportMoney);
        players.push(msg.sender);
        //将支持者加进playersMap,并将value设置为true表示已支持
        playersMap[msg.sender] = true;
    }

    //退款操作,在时间到了以后,所有人都可以发起
    function refundByAnyone() public needIsComplete {
        //如果超时了需要退款
        require(getRemainSecond() < 0);
        //需要众筹没成功才能发起退款
        require(!isFundingSuccess);
        refund();
    }

    //众筹未完成前可以发起者可以主动退款
    function refundByManager() public needUnComplete onlyManagerCanCall {
        refund();
    }

    function refund() private {
        for (uint i = 0; i < players.length; i++) {
            players[i].transfer(supportMoney);
            playersMap[players[i]] = false;
        }
        players = new address[](0);
        endTime = now;
        isComplete = true;
        //退款后摧毁当前合约
        selfdestruct(this);
    }

    //获取当前合约是否结束(是否到结束的时间)
    function getIsComplete() public view returns (bool){
        return isComplete;
    }

    modifier onlyManagerCanCall(){
        require(msg.sender == manager);
        _;
    }

    //需要众筹未结束时才能调用的修饰符
    modifier needUnComplete(){
        require(!isComplete);
        _;
    }

    //需要众筹结束后才能调用的修饰符
    modifier needIsComplete(){
        require(isComplete);
        _;
    }

}