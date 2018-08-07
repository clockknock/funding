pragma solidity ^0.4.24;

contract FundingFactory{

    //存储所有已经部署的智能合约的地址
    address[] public fundings;

    function deploy(string _projectName,uint _supportMoney,uint _goalMoney) public{
        address funding = new Funding(_projectName,_supportMoney,_goalMoney, msg.sender);
        fundings.push(funding);
    }

    function getFundings() public view returns (address[])  {
        return fundings;
    }
}

contract Funding{
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
    // 众筹参与人的数组
    address[] private players;
    mapping(address=>bool) public playersMap;
    //众筹是否完成
    bool isComplete;


    //付款请求申请的数组(由众筹发起人申请)
    Request[] public requests;

    // 返回参与人的数量
    function getPlayersCount() public view returns(uint){
        return players.length;
    }

    function getPlayers() public view returns(address[]){
        return players;
    }

    function getTotalBalance() public view returns (uint){
        return address(this).balance;
    }

    function getRemainSecond() public view returns(uint){
        return (endTime - now);
    }

    function getSupportMoney() public view returns(uint){
        return supportMoney;
    }

    function getManager() public view returns(address){
        return manager;
    }

    function getProjectName() public view returns(string){
        return projectName;
    }

    function getGoalMoney() public view returns(uint){
        return goalMoney;
    }


    function getRequestSize() public view returns(uint){
        return requests.length;
    }

    // 付款请求的结构体
    struct Request{
        string description; // 为什么要付款
        uint money; // 花多少钱
        address shopAddress; //  卖家的钱包 地址
        bool complete;  //  付款是否已经完成
        mapping(address=>bool) votedMap; // 哪些已经投过票的人
        uint  voteCount; // 投票的总的总数
    }

    function getRequestDescriptionAt(uint index) public view returns(string){
        return requests[index].description;
    }

    function getRequestMoneyAt(uint index) public view returns(uint){
        return requests[index].money;
    }

    function getRequestShopAddressAt(uint index) public view returns(address){
        return requests[index].shopAddress;
    }

    function getRequestCopleteAt(uint index) public view returns(bool){
        return requests[index].complete;
    }

    function getRequestVoteCountAt(uint index) public view returns(uint){
        return requests[index].voteCount;
    }

    function isVotedAt(uint index,address _addr)public view returns(bool){
        return requests[index].votedMap[_addr];
    }

    //  构造函数
    constructor(string _projectName,uint _supportMoney,uint _goalMoney, address _address) public{
        manager = _address;
        projectName = _projectName;
        supportMoney = _supportMoney;
        goalMoney = _goalMoney;
        endTime = now + 4 weeks;
    }

    function createRequest( string _description, uint _money, address _shopAddress) public  onlyManagerCanCall{
        Request memory request = Request({
            description:_description,
            money:_money,
            shopAddress:_shopAddress,
            complete:false,
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
        request. voteCount ++;
        requests[index].votedMap[msg.sender] = true;
    }

    //众筹发起人调用, 可以调用完成付款, index:下标
    function finalizeRequest(uint index) public  onlyManagerCanCall {
        Request storage request = requests[index];
        // 付款 必须是 未 处理的
        require(!request.complete);
        //  至少一半以上的参与者 同意付款
        require(request.voteCount * 2 >players.length );
        // 打钱  转账
        require(address(this).balance>=request.money);
        request.shopAddress.transfer(request.money);
        request.complete = true;
    }


    //是否是支持者
    function isSupporter(address _addr) public view returns(bool){
        return playersMap[_addr];
    }

    //  参与人支持众筹
    function support() public needUnComplete payable{
        require(!playersMap[msg.sender]);
        require(msg.value == supportMoney);
        players.push(msg.sender);
        //设置mapping集合
        playersMap[msg.sender] = true;
    }

    //退款操作
    function refund() public{
        //如果超时了需要退款
        require(getRemainSecond()<0);
        //如果筹集的款没有到达目标金额需要退款
        require(address(this).balance<goalMoney);
        for(uint i =0;i < players.length;i++){
            players[0].transfer(supportMoney);
        }
        players = new address[](0);
    }

    //众筹未完成前可以发起者可以主动退款
    function refundByManager() public needUnComplete{
        for(uint i =0;i < players.length;i++){
            players[i].transfer(supportMoney);
            playersMap[players[i]]=false;
        }
        players = new address[](0);
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

}