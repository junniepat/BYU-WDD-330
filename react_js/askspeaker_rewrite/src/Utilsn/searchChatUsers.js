import { useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {Input as Search} from "antd";
let globalVisitors = [];


const SearchBar = ({
  pubnub,
  msgDetailmap,
  callback1,
  channel,
  myspeakerid,
  eventID,
  senderChannnel,
  sendInviteCallback,
  dpname,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visitors, updateVisitors] = useState(globalVisitors);
  const [filteredVisitors, updateFiltered] = useState([]);
  const [visitorPageIndex, setVisitorPageIndex] = useState('');
  const [isloadmore, setIsLoadmore] = useState(false);
  const [onlineVisitors, setOnlineVisitors] = useState([]);
  const [allEventVisitors, setAllEventVisitors] = useState(new Map());
  const [allEventVisitors_fin, setAllEventVisitors_fin] = useState(new Map());
  const [onlinevisitorsarr, setOnlineVisitorsArr] = useState(new Set());
  const [curonlinevisitorsarr, setCurOnlineVisitorsArr] = useState(new Set());


  // function filterVisitors(visitors, query) {
  //   var res = [];
  //   try {
  //     ////console.log("filterVisitors:", query, visitors);

  //     if (!query || !visitors) {
  //       ////console.log("filterVisitors-default", visitors);
  //       return visitors;
  //     }
  //     ////console.log("filterVisitors-x", visitors);

  //     if (visitors.length > 0) {
  //       res = visitors.filter(visitor => {
  //         if (visitor.name === null || visitor.name === '') {
  //           return false;
  //         } else {
  //           return visitor.name.toLowerCase().includes(query);
  //         }
  //       });
  //     }
  //   } catch (e) {
  //     console.log('ERROR' + e);
  //   }
  //   //console.log(res);
  //   ////console.log("filterVisitors-r", res);
  //   return res;
  // }
  
  
  // function loadVisitors(search, callback) {
  //   //console.log('loadVisitors:', search);
  //   try {
  //     if (search.length == 0) {
  //       return;
  //     }
  //     if (search.length == 1) {
  //       //globalVisitors = [];
  //       //updateVisitors([]);
  //       return;
  //     }
  //     //if (search.length < 2) return;

  //     globalVisitors = [];
  //     ////console.log("loadVisitors:#", globalVisitors.length);
  //     const filter = search ? 'uuid.name LIKE "*' + search + '*"' : '';
  //     pubnub.objects.getChannelMembers(
  //       {
  //         channel: 'global_' + eventID,
  //         include: {
  //           totalCount: true,
  //           customFields: true,
  //           channelFields: true,
  //           customChannelFields: true,
  //         },
  //         filter: filter,
  //       },
  //       (response, uuid) => {
  //         if (!response.error && Array.isArray(uuid.data) && !uuid.length) {
  //           uuid.data.map(user => {
  //             globalVisitors.push({ id: user.uuid.id, name: user.uuid.name });
  //           });

  //           if (callback) {
  //             callback(globalVisitors);
  //           }
  //           if (globalVisitors.length > 0) {
  //             updateFiltered(globalVisitors);
  //           }
  //         }
  //       }
  //     );
  //   } catch (e) {
  //     console.log('ERROR' + e);
  //   }
  //   //document.getElementById("loadmore").style.display='none';
  // }

  // function intersect(a, b) {
  //   return a.filter(Set.prototype.has, new Set(b));
  // }

  // function getOnlineUsers() {
  //   //  console.log('Online visitor fetch');
  //   //console.log(allvisitors);

  //   var onlinevisitors = new Map();
  //   var global_ch = 'global_' + eventID;
  //   pubnub
  //     .hereNow({
  //       channels: [global_ch],
  //       includeUUIDs: true,
  //       includeState: true,
  //     })
  //     .then(response => {
  //       if (response.totalOccupancy > 0) {
  //         var key = Object.keys(response.channels)[0];
  //         //console.log(key);

  //         if (key == global_ch) {
  //           var occupants = response.channels[global_ch].occupants;
  //           //  console.log(occupants);
  //           var a = new Set();
  //           // onlinevisitors = new Map();
  //           occupants.map((value, index) => {
  //             //console.log(value.uuid);
  //             a.add(value.uuid);
  //           });
  //           //const filteredArray = a.filter(value => onlineVisitors.includes(value));
  //           setOnlineVisitorsArr(a);
  //           //  console.log(a);
  //           //console.log(onlinevisitors.keys());
  //         }
  //       }
  //       // console.log(onlinevisitors);
  //       // setOnlineVisitors(onlinevisitors);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // }

  // // useEffect(){

  // // }

  // function loadAllVisitors(callback) {
  //   globalVisitors = [];
  //   //console.log("loadAllVisitors started");
  //   // setInterval(function() {
  //   var cursor = true;

  //   // console.log(visitorPageIndex);
  //   cursor = false;
  //   pubnub.objects.getChannelMembers(
  //     {
  //       channel: 'global_' + eventID,
  //       include: {
  //         totalCount: true,
  //         customFields: true,
  //         channelFields: true,
  //         customChannelFields: true,
  //         //page:'MjAw',
  //       },
  //       page: {
  //         next: visitorPageIndex,
  //         //prev: string;
  //       },
  //       //page:  { visitorPageIndex }
  //     },
  //     (response, uuid) => {
  //       // // console.log(uuid);
  //       var a = new Map();
  //       if (!response.error && Array.isArray(uuid.data) && !uuid.length) {
  //         //console.log(uuid.data.length);
  //         if (uuid.data.length > 0) {
  //           //console.log('Visitor list >0');

  //           var m = allEventVisitors;
  //           uuid.data.map(user => {
  //             //a = new Map();
  //             //console.log('COntrol is indide ' + user.uuid.id);
  //             globalVisitors.push({
  //               id: user.uuid.id,
  //               name: user.uuid.name,
  //             });

  //             m.set(user.uuid.id, user.uuid.name);
  //           });
  //           setAllEventVisitors(m);

  //           if (uuid.data.length == 100) {
  //             //  console.log('Next cursor: ' + uuid.next);
  //             setIsLoadmore(true);
  //             setVisitorPageIndex(uuid.next);
  //             cursor = true;
  //           } else {
  //             setIsLoadmore(false);
  //             cursor = false;
  //             //  setVisitorPageIndex('');
  //           }
  //         } else {
  //           //  console.log('Visitor list 0');
  //           // setVisitorPageIndex('');
  //           cursor = false;
  //           setIsLoadmore(false);
  //         }
  //       }
  //     }
  //   );

  //   //}, 10000);
  //   if (callback) {
  //     callback(globalVisitors);
  //   }

  //   return globalVisitors;
  // }
  // Array.prototype.remove = function() {
  //   var what,
  //     a = arguments,
  //     L = a.length,
  //     ax;
  //   while (L && this.length) {
  //     what = a[--L];
  //     while ((ax = this.indexOf(what)) !== -1) {
  //       this.splice(ax, 1);
  //     }
  //   }
  //   return this;
  // };
  
  // function formOnlineUsers() {
  //   var x = [...onlinevisitorsarr].sort();
  //   var y = [...curonlinevisitorsarr].sort();

  //   if (JSON.stringify(x) != JSON.stringify(y)) {
  //     [...onlinevisitorsarr].map(visitorid => {
  //       if ([...curonlinevisitorsarr].indexOf(visitorid) < 0) {
  //         setCurOnlineVisitorsArr(a => [...a, visitorid]);
  //       }
  //     });
  //     //console.log([...curonlinevisitorsarr]);
  //     var filteredArray = [...onlinevisitorsarr].filter(value =>
  //       [...curonlinevisitorsarr].includes(value)
  //     );
  //     //console.log(filteredArray);
  //     if (filteredArray.length == 0) {
  //       setCurOnlineVisitorsArr([...onlinevisitorsarr]);
  //     } else {
  //       [...curonlinevisitorsarr].map(visitorid => {
  //         if (filteredArray.indexOf(visitorid) < 0) {
  //           var a = [...curonlinevisitorsarr].indexOf(visitorid);
  //           var b = [...curonlinevisitorsarr].filter(function(e) {
  //             return e !== visitorid;
  //           });
  //           setCurOnlineVisitorsArr(b);
  //         }
  //       });
  //     }
  //     setAllEventVisitors_fin([...allEventVisitors]);
  //   }
  // }

  // useEffect(() => {
  //   // setInterval(function() {
  //   loadAllVisitors(updateVisitors);
  //   //  }, 20000);
  // }, [visitorPageIndex]);

  // // useEffect(() => {
  // //   getOnlineUsers();
  // // }, []);

  // useEffect(() => {
  //   loadAllVisitors(updateVisitors);
  //   getOnlineUsers();
  //   setInterval(function() {
  //     loadAllVisitors(updateVisitors);
  //     getOnlineUsers();
  //   }, 60000);
  // }, []);

  // useEffect(() => {
  //   formOnlineUsers();
  // }, [onlinevisitorsarr]);

  // useEffect(() => {
  //   loadVisitors(searchQuery, updateVisitors);
  // }, [searchQuery]);

  // const onSubmit = e => {
  //   setSearchQuery(searchQuery);
  //   ////console.log("search: on submit/", searchQuery);
  //   e.preventDefault();
  // };
  // const onInput = val => {
  //   ////console.log("search: onInput");
  //   setSearchQuery(val);
  //   ////console.log("search: onInput/", val);
  // };





  return (
    <div>seaech
        {/* <h6>Search visitors by name</h6>
        <Search
        value={searchQuery}
        onInput={e => onInput(e.target.value)}
        id="header-search"
        name="s"
            placeholder="Search online users"
            allowClear
            size="large"
            // onSearch={onSearch}
            enterButton
        /> 

      <div>
        {searchQuery.length > 0 ? (
          <>
            {filteredVisitors.map(visitor => (
            <div>
                {visitor.name}
              {/* <span
                style={visitorname}
                onClick={() => {
                  callback1(visitor.id, visitor.name);
                  loadMessages(
                    visitor.id,
                    eventID,
                    senderChannnel,
                    msgDetailmap,
                    channel,
                    myspeakerid,
                    sendInviteCallback,
                    visitor.name,
                    !isEnable,
                    dpname
                  );
                }}
              >
                {visitor.name}
              </span> */}
            {/* </div>
          ))}
          </>
        ) : (
          <> */}
         {/* {[...curonlinevisitorsarr].map((visitorid, index) =>
            //  (alleventvisitorsmap.has(visitorid) >= 0 )?

            typeof allEventVisitors_fin.get(visitorid) != 'undefined' &&
            allEventVisitors_fin.get(visitorid) != '' &&
            allEventVisitors_fin.get(visitorid) != null ? (
              <div key={visitorid}>
                <span
                  onClick={() => {
                    callback1(visitorid, allEventVisitors_fin.get(visitorid));
                    // loadMessages(
                    //   visitorid,
                    //   eventID,
                    //   senderChannnel,
                    //   msgDetailmap,
                    //   channel,
                    //   myspeakerid,
                    //   sendInviteCallback,
                    //   alleventvisitorsmap.get(visitorid),
                    //   !isEnable
                    // );
                  }}
                >
                  {allEventVisitors_fin.get(visitorid)}
                </span>
              </div>
            ) : (
              console.log('skip')
            )
          )} */}
          {/* </>
          // <div></div>
        )}
      </div> */} 
    </div>
  );
};



export default SearchBar;
