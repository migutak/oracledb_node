var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('../dbconfig.js');

const router = express.Router();

function doRelease(connection) {
    connection.close(
        function (err) {
            if (err)
                console.error(err.message);
        });
}

router.post("/viewall", (req, res, next) => {
    getData(req.body, function (rows, lastRow) {
        res.json({rows: rows, lastRow: lastRow});
    });
});


function getData(request, resultsCallback) {
    const SQL = buildSql(request);
    oracledb.getConnection(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                SQL,[],{}, function (err, result) {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                        return;
                    }
                    const rowCount = getRowCount(request, result.rows);
                    const resultsForPage = cutResultsToPageSize(request, result.rows);

                    resultsCallback(resultsForPage, rowCount);
                    doRelease(connection);
                });
        });
}

function buildSql(request) {
    const selectSql = createSelectSql(request);
    const fromSql = ' from ptps p join tqall t on p.accnumber=t.accnumber where p.met !=\'met\' ';
    const whereSql = createWhereSql(request);
    const limitSql = createLimitSql(request);

    const orderBySql = createOrderBySql(request);
    const groupBySql = createGroupBySql(request);

    const SQL = selectSql + fromSql + whereSql + groupBySql + orderBySql + limitSql;

    console.log(SQL);

    return SQL;
}

function createSelectSql(request) {
    console.log(request)
    const rowGroupCols = request.rowGroupCols;
    const valueCols = request.valueCols;
    const groupKeys = request.groupKeys;

    if (isDoingGrouping(rowGroupCols, groupKeys)) {
        const colsToSelect = [];

        const rowGroupCol = rowGroupCols[groupKeys.length];
        colsToSelect.push(rowGroupCol.field);

        valueCols.forEach(function (valueCol) {
            colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') as ' + valueCol.field);
        });

        return ' select ' + colsToSelect.join(', ');
    }
        // select *
    return ' select * ';
}

function createFilterSql(key, item) {
    switch (item.filterType) {
        case 'text':
            return createTextFilterSql(key, item);
        case 'number':
            return createNumberFilterSql(key, item);
        default:
            console.log('unkonwn filter type: ' + item.filterType);
    }
}

function createNumberFilterSql(key, item) {
    switch (item.type) {
        case 'equals':
            return key + ' = ' + item.filter;
        case 'notEqual':
            return key + ' != ' + item.filter;
        case 'greaterThan':
            return key + ' > ' + item.filter;
        case 'greaterThanOrEqual':
            return key + ' >= ' + item.filter;
        case 'lessThan':
            return key + ' < ' + item.filter;
        case 'lessThanOrEqual':
            return key + ' <= ' + item.filter;
        case 'inRange':
            return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
        default:
            console.log('unknown number filter type: ' + item.type);
            return 'true';
    }
}

function createTextFilterSql(key, item) {
    switch (item.type) {
        case 'equals':
            return 'upper(' + key + ') = \'' + (item.filter).toUpperCase() + '\'';
        case 'notEqual':
            return 'upper(' + key + ') != \'' + (item.filter).toUpperCase() + '\'';
        case 'contains':
            return 'upper(' + key + ') like \'%' + (item.filter).toUpperCase() + '%\'';
        case 'notContains':
            return 'upper(' + key + ') not like \'%' + (item.filter).toUpperCase() + '%\'';
        case 'startsWith':
            return 'upper(' + key + ') like \'' + (item.filter).toUpperCase() + '%\'';
        case 'endsWith':
            return 'upper(' + key + ') like \'%' + (item.filter).toUpperCase() + '\'';
        default:
            console.log('unknown text filter type: ' + item.type);
            return 'true';
    }
}

function createWhereSql(request) {
    const rowGroupCols = request.rowGroupCols;
    const groupKeys = request.groupKeys;
    const filterModel = request.filterModel;

    // console.log(filterModel)

    const that = this;
    const whereParts = [];

    if (groupKeys.length > 0) {
        groupKeys.forEach(function (key, index) {
            const colName = rowGroupCols[index].field;
            whereParts.push(colName +  '= \'' + key + '\'')
            //   whereParts.push(colName +  '= "' + key + '"')
        });
    }

    if (filterModel) {
        const keySet = Object.keys(filterModel);
        keySet.forEach(function (key) {
            const item = filterModel[key];
            console.log(item);
            console.log('key__',key);
            whereParts.push(createFilterSql(key, item));
        });
    }

    if (whereParts.length > 0) {
        return ' and ' + whereParts.join(' and ');
    } else {
        return '';
    }
}

function createGroupBySql(request) {
    const rowGroupCols = request.rowGroupCols;
    const groupKeys = request.groupKeys;

    if (isDoingGrouping(rowGroupCols, groupKeys)) {
        const colsToGroupBy = [];

        const rowGroupCol = rowGroupCols[groupKeys.length];
        colsToGroupBy.push(rowGroupCol.field);

        return ' group by ' + colsToGroupBy.join(', ');
    } else {
        // select all columns
        return '';
    }
}

function createOrderBySql(request) {
    const rowGroupCols = request.rowGroupCols;
    const groupKeys = request.groupKeys;
    const sortModel = request.sortModel;

    const grouping = isDoingGrouping(rowGroupCols, groupKeys);

    const sortParts = [];
    if (sortModel) {

        const groupColIds =
            rowGroupCols.map(groupCol => groupCol.id)
                .slice(0, groupKeys.length + 1);

        sortModel.forEach(function (item) {
            if (grouping && groupColIds.indexOf(item.colId) < 0) {
                // ignore
            } else {
                sortParts.push(item.colId + ' ' + item.sort);
            }
        });
    }

    if (sortParts.length > 0) {
        return ' order by ' + sortParts.join(', ');
    } else {
        return '';
    }
}

function isDoingGrouping(rowGroupCols, groupKeys) {
    // we are not doing grouping if at the lowest level. we are at the lowest level
    // if we are grouping by more columns than we have keys for (that means the user
    // has not expanded a lowest level group, OR we are not grouping at all).
    return rowGroupCols.length > groupKeys.length;
}

function createLimitSql(request) {
    const startRow = request.startRow;
    const endRow = request.endRow;
    const pageSize = endRow - startRow;

    return ' OFFSET ' + startRow + ' ROWS FETCH NEXT ' + (pageSize + 1) + ' ROWS only'
    // return ' limit ' + (pageSize + 1) + ' offset ' + startRow;
}


function cutResultsToPageSize(request, results) {
    const pageSize = request.endRow - request.startRow;
    if (results && results.length > pageSize) {
        return results.splice(0, pageSize);
    } else {
        return results;
    }
}

function getRowCount(request, results) {
    if (results === null || results === undefined || results.length === 0) {
        return null;
    }
    const currentLastRow = request.startRow + results.length;
    return currentLastRow <= request.endRow ? currentLastRow : -1;
}

module.exports = router;