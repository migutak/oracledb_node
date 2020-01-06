import { Component, OnInit, ViewChild } from '@angular/core';
import { EcolService } from '../../../services/ecol.service';
import { JqxDomService } from '../../../shared/jqwidgets-dom.service';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridOptions, IDatasource, IGetRowsParams, GridApi } from 'ag-grid-community';
import * as $ from 'jquery';


@Component({
  selector: 'app-viewall',
  templateUrl: './viewall.component.html',
  styleUrls: ['./viewall.component.scss']
})
export class ViewallComponent implements OnInit {

  public overlayLoadingTemplate;
  public overlayNoRowsTemplate;
  filterText: any;

  constructor(private ecolService: EcolService, private http: HttpClient) {
    this.gridOptions = <GridOptions>{
      enableSorting: true,
          enableFilter: true,
      headerHeight: 40,
      pagination: true,
      rowSelection: 'single',
      rowModelType: 'infinite',
      cacheBlockSize: 20,
      paginationPageSize: 20
    };

    this.overlayLoadingTemplate =
      // tslint:disable-next-line:max-line-length
      '<img src="assets/img/user/cooop1.gif" />';
    this.overlayNoRowsTemplate =
      '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">This is a custom \'no rows\' overlay</span>';

  }


  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  resizeEvent = 'resize.ag-grid';
  $win = $(window);
  new = true;
  username: string;
  searchText: string;
  model: any = {};
  noTotal: number;

  gridOptions: GridOptions;
  gridApi: GridApi;
  // private rowClassRules;

  columnDefs = [
    {
      headerName: 'ACCNUMBER',
      field: 'accnumber',
      
      filter: "agTextColumnFilter",
      // cellRenderer: function (params) {
      //   return '<a  href="#" target="_blank">' + params.value + '</a>';
      // },
      cellRenderer:
      function(params) {
        if (params.value !== undefined) {
          return '<a  href="#" target="_blank">' + params.value + '</a>';
        } else {
          return '<img src="assets/img/user/loading.gif">';
        }
      }
      // resizable: true,
      // checkboxSelection: true
    },
    {
      headerName: 'CUSTNUMBER',
      field: 'custnumber',
      cellRenderer:
      function(params) {
        if (params.value !== "") {
          return params.value;
        } else {
          return '<img src="assets/img/user/loading.gif">';
        }
      }
      // resizable: true, sortable: true, filter: true
    },
    {
      headerName: 'CUSTNAME',
      filter: "agTextColumnFilter",
      field: 'clientname',
    //   getQuickFilterText: function(params) {
    //     return params.value.name;
    // }
     
      filterParams:{
        newRowsAction: "keep"
      },
      cellRenderer:
      function(params) {
        if (params.value !== undefined) {
          return params.value;
        } else {
          return '<img src="assets/img/user/loading.gif">';
        }
      }
      
      // width: 450,
      // resizable: true
    },
    {
      headerName: 'DAYSINARREARS',
      field: 'daysinarr',
      cellStyle: function (params) {
        if (params.value < '30') {
          return { color: 'red' };
        } else if (params.value > '90') {
          return { color: 'red' };
        } else {
          return null;
        }
      },
      // resizable: true
    },
    {
      headerName: 'TOTALARREARS',
      field: 'instamount',
      // resizable: true,
      valueFormatter: this.currencyFormatter
    },
    {
      headerName: 'OUSTBALANCE',
      field: 'oustbalance',
      valueFormatter: this.currencyFormatter
      // resizable: true
    },
    {
      headerName: 'BUCKET',
      field: 'bucket'
      // resizable: true
    },
    {
      headerName: 'AROCODE',
      field: 'arocode'
      // resizable: true
    },
    {
      headerName: 'RROCODE',
      field: 'rrocode',
      // resizable: true,
      // filter: true
    },
    {
      headerName: 'SECTION',
      field: 'section'
    },
    {
      headerName: 'COLOFFICER',
      field: 'colofficer'
    }
  ];

  rowData1: any;

  


  dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {

      // Use startRow and endRow for sending pagination to Backend
      // params.startRow : Start Page
      // params.endRow : End Page
      //
      this.apiService(20, params.startRow).subscribe(response => {
        params.successCallback(
          response.rows, response.total
        );
        this.gridOptions.api.hideOverlay();
      });
    }
  };

  currencyFormatter(params) {
    return (Math.floor(params.value * 100) / 100).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
  onRowDoubleClicked(event: any) {
    this.model = event.node.data;
    // console.log(this.model);
    // tslint:disable-next-line:max-line-length
    window.open(environment.applink + '/activitylog?accnumber=' + this.model.accnumber + '&custnumber=' + this.model.custnumber + '&username=' + this.currentUser.username + '&sys=collections', '_blank');
  }

  

  // onQuickFilterChanged($event) {
  //   // this.gridOptions.api.setQuickFilter($event.target.value);
  //   this.searchText = $event.target.value;
  // }

  onSearch() {
    if (this.model.searchText === undefined) {
      return;
    }
    this.clear();
    this.gridApi.showLoadingOverlay();
    /*this.http.get<any>(environment.api + '/api/qall/search?searchtext=' + this.model.searchText).subscribe(resp => {
      //
      this.gridApi.updateRowData({ add: resp, addIndex: 0 });
      this.gridApi.hideOverlay();
    });*/
    this.dataSource = {
      getRows: (params: IGetRowsParams) => {
        // Use startRow and endRow for sending pagination to Backend
        // params.startRow : Start Page
        // params.endRow : End Page
        //
        this.apiServiceSearch(20, params.startRow).subscribe(response => {
          console.log(response);
          params.successCallback(
            response.rows, response.total
          );
          this.gridOptions.api.hideOverlay();
        });
      }
    };

    this.gridApi.setDatasource(this.dataSource);
  }

  clear() {
    const ds = {
      getRows(params: any) {
        params.successCallback([], 0);
      }
    };
    this.gridOptions.api.setDatasource(ds);
  }

  reset() {
    this.gridApi.showLoadingOverlay();
    this.clear();
    this.dataSource = {
      getRows: (params: IGetRowsParams) => {
        // Use startRow and endRow for sending pagination to Backend
        // params.startRow : Start Page
        // params.endRow : End Page
        //
        this.apiService(20, params.startRow).subscribe(response => {
          params.successCallback(
            response.rows, response.total
          );
          this.gridOptions.api.hideOverlay();
        });
      }
    };
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDatasource(this.dataSource);
  }

  public ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.username = currentUser.username;

    /*this.ecolService.totaltqall().subscribe(viewall => {
      this.noTotal = viewall[0].TOTALVIEWALL;
    });*/
  }

  gridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDatasource(this.dataSource);
    this.gridOptions.api.showLoadingOverlay();
  }

  apiService(perPage, currentPos) {
    // return this.http.get<any>(environment.api + '/api/qall?filter[limit]=' + perPage + '&filter[skip]=' + currentPos);
    // tslint:disable-next-line:max-line-length
    return this.http.get<any>(environment.api + '/api/tqall/paged/myallocation?colofficer=' + this.username + '&limit=' + perPage + '&page=' + currentPos);
  }

  apiServiceSearch(perPage, currentPos) {
    // tslint:disable-next-line:max-line-length
    return this.http.get<any>(environment.api + '/api/tqall/search?searchtext=' + this.model.searchText + '&limit=' + perPage + '&page=' + currentPos);
  }
  
  
sortAndFilter(allOfTheData, sortModel, filterModel) {
  return this.sortData(sortModel, this.filterData(filterModel, allOfTheData));
}
sortData(sortModel, data) {
 
}
applyFilter(){
  this.gridApi.setFilterModel({"clientname":{filter: this.filterText}})
}

 filterData(filterModel, data) {
  let filterPresent = filterModel && Object.keys(filterModel).length > 0;
  if (!filterPresent) {
    return data;
  }
  data = data.filter(i=>{
    if(Object.keys(i).some(k => i[k] && i[k].toString().toLowerCase().includes(filterModel['-'].filter)))
      return i;
  })
  return data;
}


}