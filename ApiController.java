package bisag.gatishakti.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.Principal;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.spec.SecretKeySpec;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import javax.validation.constraints.NotNull;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.hibernate.hql.internal.ast.tree.IsNotNullLogicOperatorNode;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.ui.Model;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

import bisag.gatishakti.Entities.CheckSum;
import bisag.gatishakti.Entities.DeletedRecordStatus;
import bisag.gatishakti.Repository.AirVoiceRepo;
import bisag.gatishakti.Repository.ConsolidatedReportRepo;
import bisag.gatishakti.Repository.DeletedRepo;
import bisag.gatishakti.Repository.DemosampleRepo;
import bisag.gatishakti.Repository.GroundForceRepo;
import bisag.gatishakti.Repository.beidourepo;
import bisag.gatishakti.Repository.elintxlsxrepo;
import bisag.gatishakti.Repository.navxlsxrepo;
import bisag.gatishakti.Repository.ImageRequest.DocreaderRepo;
import bisag.gatishakti.Repository.ImageRequest.ImageRequestRepo;
import bisag.gatishakti.Services.GeoServerApi;
import bisag.gatishakti.utills.ApiCall;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.crypto.DefaultJwtSignatureValidator;

@RestController
@SuppressWarnings({ "unused", })
public class ApiController {
	static Logger log = Logger.getLogger(ApiController.class);
	@PersistenceContext
	private EntityManager entityManager;
	@Autowired
	JdbcTemplate template;

	@Autowired
	private GeoServerApi geoServerApi;

	@Autowired
	private ImageRequestRepo imageRequestRepo;

	@Autowired
	private Environment env;

	///// for delete ////
	@Autowired
	elintxlsxrepo elintRepo;

	@Autowired
	navxlsxrepo navRepo;

	@Autowired
	DemosampleRepo demoRepo;

	@Autowired
	DocreaderRepo docRepo;

	@Autowired
	GroundForceRepo groundRepo;

	@Autowired
	beidourepo beioduRepo;

	@Autowired
	ConsolidatedReportRepo consolidateRepo;

	@Autowired
	AirVoiceRepo airvoiceRepo;

	@Autowired
	DeletedRepo deletedRepo;

	@Value("${spring.profiles.active}")
	String activeProfile;

	////

	@CrossOrigin
	@GetMapping("/getSearchGeneral/{searchstring}")
	public List<Map<String, Object>> getsearchstring1(@PathVariable(value = "searchstring") String searchstring) {

		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		// code 1 ---------------------
		if (searchstring.length() > 4) {
			String[] arr = { "Airports", "Helipads", "Bus_Stand", "Bus_Terminus", "City_Area", "Communication_POIS",
					"Communication_Area", "Defence_Bases", "Educational_Institutions_Area",
					"Educational_Institutions_Points", "Entertainment_Area", "Entertainment_Points",
					"Government_Organisations_Area", "government_organisations_pois", "industries",
					"infrastructure_area", "infrastructure_pois", "land_parcel", "landmarks_area", "landmarks_pois",
					"landuse", "localities_area", "metro_rail", "natural_area", "natural_points", "natural_resources",
					"other_roads", "other_roads", "point_of_interest", "point_of_interest_area", "primary_link_road",
					"primary_road", "Railway_Line", "railway_station", "region", "religious_places_area",
					"religious_places_pois", "secondary_link_road", "secondary_road", "territorial_waters",
					"tertiary_road2", "tertiary_road3", "tertiary_road_residential1", "tertiary_road_residential2",
					"tertiary_road_residential3", "tourism_area", "tourism_pois", "traffic", "transport_area",
					"transport_node", "transport_node_area", "transport_other", "trunk_road", "villages_area",
					"waterbodies", "waterways", "abandon_populated", "capital_of_a_political_entity",
					"destroyed_populated_place", "farm_village", "historical_capital_of_a_political_entity",
					"historical_populated_place", "israeli_settlement", "populated_locality", "populated_place2",
					"religious_populated_place", "fifth_order_administrative_division",
					"first_order_administrative_division", "fourth_order_administrative_division",
					"second_order_administrative_division", "third_order_administrative_division",
					"seat_of_government_of_a_entity", "section_of_populated_place", "p_pplch", "p_stlmt", "p_",
					"p_pplg", "p_pplh", "p_pplr", "p_ppls" };

			for (int i = 0; i < arr.length; i++) {
				String q1 = "SELECT DISTINCT (" + '"' + arr[i] + '"' + "" + "." + "" + '"' + "asciiname" + '"'
						+ ") as asciiname, '" + arr[i] + "' as tbl  FROM " + '"' + arr[i] + '"'
						+ " where  UPPER(asciiname) ILIKE ('%" + searchstring + "%') Group By " + '"' + arr[i] + '"'
						+ "" + "." + "" + '"' + "asciiname" + '"' + ",tbl limit 10";

				List<Map<String, Object>> list0 = template.queryForList(q1);
				list.addAll(list0);
				// System.err.println("query selected --- " + q1);
			}
		}
		return list;
	}

	//////////////////////

	@PostMapping("highlight_report") // for highlight reports
	public List<Map<String, Object>> highlight_report(@RequestParam("report") String report,
			@RequestParam("layername") String layername) {
		try {
			String q = "";

			if (layername.equals("docreader")) {
				// endcap=flat
				q += "select st_buffer(geom,0.01,' join=round') fromfrom " + layername + " where report_no = '" + report
						+ "'";
			} else {
				q += "select id,st_buffer(geom,0.02,'join=round') as geom from " + layername
						+ " where  docreportnumber = '" + report + "'";
			}
			String queryall = "select jsonb_build_object('type','FeatureCollection','features',jsonb_agg(feature))"
					+ " from ("
					+ "        select jsonb_build_object('type','Feature','id',id,'geometry',ST_AsGeoJSON(geom)::jsonb, 'properties', to_jsonb(row) - 'gid' - 'geom') AS feature"
					+ " from ( " + q + " ) row" + ") features";
			System.out.println(queryall);
			System.err.println(queryall);
			return template.queryForList(queryall);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	@PostMapping("getAnnexures") // get buttons of Annexures
	public List<Map<String, Object>> getAnnexures(@RequestParam("report") String report,
			@RequestParam("layername") String layername) {
		try {
			String q = "";
			if (layername.equals("docreader")) {
				q += "select distinct referencedocument from " + layername + "_referencedocument where " + layername
						+ "_id in (select id from " + layername + " where docreportnumber = '" + report + "' )";
			} else {
				q += "select distinct referencedocument from " + layername + "_referencedocument where " + layername
						+ "_id in (select id from " + layername + " where  docreportnumber = '" + report + "' )";
			}

			System.out.println(q);
			return template.queryForList(q);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;

		}

	}

	@GetMapping("getActiveProfile")
	public String getActiveProfile() {
		return activeProfile;
	}

	@PostMapping("filter_air_masterpoint") // Air Master Points (PushPin) result by filter
	public List<Map<String, Object>> filter_air_masterpoint(@RequestParam("wkt") String wkt,
			@RequestParam("date_from") Date date_from, @RequestParam("date_to") Date date_to) {
		try {
			String q_in = " Select  distinct location  from demosample Where ";
			if (!wkt.equals("") && !wkt.equals(null)) {
				q_in += "ST_Intersects(geom,'" + wkt + "') AND ST_IsValid(geom) and  ";
			}
			q_in += " (dateofinterception between '" + date_from + "' and '" + date_to + "') ";

			String q = "select  a.* from mastertable a inner join (" + q_in + ") b "
					+ " on lower(b.location) like lower('%'||substring(a.placename,0,6)||'%')";

			String queryall = "select jsonb_build_object('type','FeatureCollection','features',jsonb_agg(feature))"
					+ " from ("
					+ "        select jsonb_build_object('type','Feature','id',id,'geometry',ST_AsGeoJSON(geom)::jsonb, 'properties', to_jsonb(row) - 'gid' - 'geom') AS feature"
					+ " from ( " + q + " ) row" + ") features";
			System.out.println(q);
			System.err.println(q);
			List<Map<String, Object>> data1 = template.queryForList(queryall);
			return data1;
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}

	}

	@PostMapping("identify_filter_tool") // Identify Data shown on Master Point
	public List<Map<String, Object>> identify_filter_tool(@RequestParam("wkt") String wkt,
			@RequestParam("layername") String layername, @RequestParam("placename") String placename,
			@RequestParam("date_from") Date date_from, @RequestParam("date_to") Date date_to) {

		try {
			System.out.println(
					"========================================identify_filter_tool==========================================");
			System.out.println("====date_from==" + date_from);
			System.out.println(layername);
			String q = "";
			if (layername.equals("demosample")) {// AIR DATA
				q = " Select  distinct docreportnumber,dochighlight,doctitle,docreportdate  from demosample Where ";
				if (!wkt.equals("") && !wkt.equals(null)) {
					q += "ST_Intersects(geom,'" + wkt + "') AND ST_IsValid(geom) and  ";
				}
				q += " (dateofinterception between '" + date_from + "' and '" + date_to
						+ "') AND lower(location) like lower('%'||substring('" + placename
						+ "',0,4)||'%') order by docreportnumber";
				// + " and dateofinterception between '"+date_from+"' and '"+date_to+"' and
				// location ~* '"+placename+"'";
			} else if (layername.equals("navxlsxmodel")) {// NAV DATA
				q = "Select  distinct docreportnumber from navxlsxmodel Where ";
				if (!wkt.equals("") && !wkt.equals(null)) {
					q += "ST_Intersects(geom,'" + wkt + "') AND ST_IsValid(geom) and ";
				}
				q += " (fromdate between '" + date_from + "' and '" + date_to + "') order by docreportnumber";
			} else if (layername.equals("elintxlsxmodel")) {// ELINT
				q = "Select  distinct docreportnumber from elintxlsxmodel Where ";
				if (!wkt.equals("") && !wkt.equals(null)) {
					q += "ST_Intersects(geom,'" + wkt + "') AND ST_IsValid(geom) and ";
				}
				q += " (docreportdate between '" + date_from + "' and '" + date_to + "') order by docreportnumber";
			} else if (layername.equals("docreader")) {// IMINT
				q = "Select  distinct docreportnumber,paragraph from docreader Where "; /// remember "where" while
																						/// adding date clause
				if (!wkt.equals("") && !wkt.equals(null)) {
					q += " ST_Intersects(geom,'" + wkt + "') AND ST_IsValid(geom) and ";
				}
				q += " (docreportdate between '" + date_from + "' and '" + date_to + "') order by docreportnumber";
			} else if (layername.equals("consolidatedreport")) {// Consolidated report
				q = "Select  distinct docreportnumber from consolidatedreport  Where"; /// remember "where" while adding
																						/// date clause
				if (!wkt.equals("") && !wkt.equals(null)) {
					q += " ST_Intersects(geom,'" + wkt + "') AND ST_IsValid(geom) and";
				}
				q += " (docreportdate between '" + date_from + "' and '" + date_to
						+ "') AND lower(location) like lower('%'||substring('" + placename + "',0,4)||'%')"
						+ " order by docreportnumber";
			} else if (layername.equals("airvoice")) {// AIR VOICE DATA
				q = " Select  distinct docreportnumber,dochighlight,doctitle,docreportdate  from airvoice Where ";
				if (!wkt.equals("") && !wkt.equals(null)) {
					q += "ST_Intersects(geom,'" + wkt + "') AND ST_IsValid(geom) and  ";
				}
				q += " (dateofinterception between '" + date_from + "' and '" + date_to
						+ "') AND lower(location) like lower('%'||substring('" + placename
						+ "',0,4)||'%') order by docreportnumber";
				// + " and dateofinterception between '"+date_from+"' and '"+date_to+"' and
				// location ~* '"+placename+"'";
			} else {
				q = "Select 'NO DATA' as nodata";
			}

			System.out.println(q);
			System.err.println(q);
			List<Map<String, Object>> data1 = template.queryForList(q);

			// System.err.println(data1);
			return data1;
			// return "hello";
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}

	}

	@PostMapping("qb_api1") // Query Builder qb_source_change
	public List<Map<String, Object>> qb_api1(@RequestParam("qb_parameter") String qb_parameter) {
		try {
			qb_parameter = tablename(qb_parameter);
			return template.queryForList("select column_name from information_schema.columns where table_name='"
					+ qb_parameter + "' order by column_name");
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	public String tablename(String source_name) { // because of security point of view and reusable code it is created
													// as separate function
		switch (source_name) { // table name cannot be seen on frontend
			case "COMBAT AIRCRAFT": {
				source_name = "demosample";
				break;
			}
			case "LOGISTICS AIRCRAFT": {
				source_name = "airvoice";
				break;
			}
			case "NAV": {
				source_name = "navxlsxmodel";
				break;
			}
			case "ELINT": {
				source_name = "elintxlsxmodel";
				break;
			}
			case "ARC IMINT": {
				source_name = "docreader";
				break;
			}
			case "CONSOLIDATED REPORT": {
				source_name = "consolidatedreport";
				break;
			}
			case "GROUND FORCE": {
				source_name = "groundforce";
				break;
			}
			case "BEIDOU": {
				source_name = "beidoumodel";
				break;
			}
			case "CMIA BEIDOU": {
				source_name = "cmiabeidou";
				break;
			}
			case "Misc": {
				source_name = "universal";
				break;
			}
			default: {
				source_name = "Not Found";
				break;
			}
		}
		return source_name;
	}

	@PostMapping("qb_api2") // Query Builder qb_column_change
	public List<Map<String, Object>> qb_api2(@RequestParam("qb_parameter1") String source_name,
			@RequestParam("qb_parameter2") String column_name) {
		try {
			source_name = tablename(source_name);
			return template.queryForList("select distinct " + column_name + " as value from " + source_name + " where "
					+ column_name + " is not null");
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	@PostMapping("qb_api3") // Query Builder Submit
	public List<Map<String, Object>> qb_api3(@RequestParam("qb_parameter1") String source_name,
			@RequestParam("qb_parameter2") String column_name, @RequestParam("qb_parameter3") String operator,
			@RequestParam("qb_parameter4") String search_value) {
		try {
			source_name = tablename(source_name);
			System.out.println("select * from " + source_name + " where " + column_name + " " + operator + " '"
					+ search_value + "'");
			return template.queryForList("select * from " + source_name + " where " + column_name + " " + operator
					+ " '" + search_value + "'");
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	// DASHBOARD start
	@PostMapping("d_api1") // Dashboard Api to get template wise count
	public List<Map<String, Object>> d_api1(@RequestParam("d_parameter") String d_parameter) {
		try {
			d_parameter = tablename(d_parameter);
			return template
					.queryForList("select COUNT(*) as count,COUNT(distinct docreportnumber) as reports,template from "
							+ d_parameter + " group by template");
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	@PostMapping("d_api2") // table on click template
	public List<Map<String, Object>> d_api2(@RequestParam("d_parameter") String source_name,
			@RequestParam("d_parameter2") String template_name) {
		try {
			source_name = tablename(source_name);
			return template.queryForList("select * from " + source_name + " where template = '" + template_name + "'");
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	@PostMapping("d_api3") // Dashboard Api to get reports wise count
	public List<Map<String, Object>> d_api3(@RequestParam("d_parameter") String source_name,
			@RequestParam("d_parameter2") String template_name) {
		try {
			source_name = tablename(source_name);
			return template.queryForList("select distinct docreportnumber,COUNT(*) as count from " + source_name
					+ " where template='" + template_name + "' group by docreportnumber");
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	@PostMapping("d_api4") // Dashboard Api to get table reports number wise
	public List<Map<String, Object>> d_api4(@RequestParam("d_parameter") String source_name,
			@RequestParam("d_parameter2") String reportno) {
		try {
			source_name = tablename(source_name);
			if (reportno.equals("null")) {
				return template.queryForList("select * from " + source_name + " where docreportnumber is null");
			} else {
				return template
						.queryForList("select * from " + source_name + " where docreportnumber='" + reportno + "'");
			}

		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	///////// tables data///////////
	@SuppressWarnings("unchecked")
	@PostMapping("tb_api1")
	public List<Map<String, Object>> tb_api1(@RequestParam("tb_parameter") String t_parameter, Model model) {
		try {
			String checksumQuery = "select distinct(docreportnumber), " + t_parameter
					+ ".file_path as tblfilepath, docreportdate, " + t_parameter
					+ ".createddate, checksum.check_sum as checksum from checksum inner join " + t_parameter + " on "
					+ t_parameter + ".file_path = checksum.file_path order by " + t_parameter + ".createddate";
			// System.out.println("ChecksumQuery === " + checksumQuery);
			List<Map<String, Object>> list = template.queryForList(checksumQuery);
			return list;
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			return null;
		}
	}

	// SKY - 10th AUGUST 2023
	@PostMapping("/masterDeleteApi")
	public String masterDeleteApi(@RequestParam("file_path") String masterFilePath,
			@RequestParam("tblName") String tblName, Principal p, HttpServletRequest request) {
		String parentFolder = "";
		String subString = "";
		String temName = "";
		String refDoc = tblName + "_referencedocument";
		if (activeProfile.equals("dev")) {
			temName = masterFilePath.split("\\\\")[2];
			parentFolder = masterFilePath.split("\\\\")[3];
			subString = masterFilePath.split("\\\\")[0] + "\\" + masterFilePath.split("\\\\")[1] + "\\"
					+ masterFilePath.split("\\\\")[2] + "\\" + masterFilePath.split("\\\\")[3];
		} else if (activeProfile.equals("prod") || activeProfile.equals("stagging")) {
			temName = masterFilePath.split("/")[3];
			parentFolder = masterFilePath.split("/")[4];
			subString = masterFilePath.split("/")[0] + "/" + masterFilePath.split("/")[1] + "/"
					+ masterFilePath.split("/")[2] + "/" + masterFilePath.split("/")[3] + "/"
					+ masterFilePath.split("/")[4];
		}
		try {
			SimpleDateFormat datef = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			String deletedon = datef.format(Calendar.getInstance().getTime());
			DeletedRecordStatus drs = new DeletedRecordStatus();
			drs.setDocreportdate("null");
			drs.setDocreportnumber("null");
			drs.setCheckSum("null");
			drs.setTemplate(temName);
			drs.setFile_path(subString);
			drs.setDeletedby(p.getName());
			drs.setIpaddress(request.getRemoteAddr());
			drs.setDeletedOn(deletedon);
			drs.setTable_name(tblName);
			deletedRepo.save(drs);
			Map<String, String> filepath_map = new LinkedHashMap<String, String>();
			filepath_map.put(refDoc, "referencedocument");
			filepath_map.put(tblName, "file_path");
			filepath_map.put("checksum", "file_path");
			filepath_map.put("fileonsuccess", "filepath");
			filepath_map.put("fileonerror", "filepath");
			if (tblName != null || tblName != "null" || tblName != "") {
				for (String table : filepath_map.keySet()) {
					String masterDeleteApiQuery = "delete from " + table + " where " + filepath_map.get(table)
							+ " like '%" + parentFolder + "%'";
					System.err.println(masterDeleteApiQuery);
					template.update(masterDeleteApiQuery);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "error";
		}
		return "Success";
	}

	/// delete record
	@PostMapping("row_del")
	public String row_del(@RequestParam("tb_parameter2") String reportno,
			@RequestParam("tb_parameter1") String t_parameter1, @RequestParam("created_date") String created_date,
			@RequestParam("check_sum") String checksum, Principal p, HttpServletRequest request) {
		try {
			SimpleDateFormat datef = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			String deletedon = datef.format(Calendar.getInstance().getTime());
			String parent_folder = "";
			String DelChkQuery = "select * from " + t_parameter1 + " inner join checksum on checksum.file_path = "
					+ t_parameter1 + ".file_path where docreportnumber = '" + reportno
					+ "' or docreportnumber is null order by " + t_parameter1 + ".id desc";
			List<Map<String, Object>> list = template.queryForList(DelChkQuery);
			if (list.size() > 0) {
				String username = p.getName();
				List<DeletedRecordStatus> dr = new ArrayList<DeletedRecordStatus>();
				for (Map<String, Object> m : list) {
					DeletedRecordStatus drs = new DeletedRecordStatus();
					drs.setDocreportnumber(reportno);
					drs.setCreatedDate(created_date);
					drs.setTable_name(t_parameter1);
					if (m.get("docreportdate") == "" || m.get("docreportdate") == null) {
						drs.setDocreportdate("null");
						drs.setFile_path(m.get("file_path").toString());
						drs.setTemplate(m.get("template").toString());
					} else if (m.get("docreportdate").toString() != null) {
						drs.setDocreportdate(m.get("docreportdate").toString());
						drs.setFile_path(m.get("file_path").toString());
						drs.setTemplate(m.get("template").toString());
					}
					drs.setCheckSum(checksum);
					drs.setDeletedby(username);
					drs.setIpaddress(request.getRemoteAddr());
					drs.setDeletedOn(deletedon);
					dr.add(drs);
					String[] temp = m.get("file_path").toString().replaceAll("\\\\", "/").split("/");
					parent_folder = temp[temp.length - 2];
				}
				deletedRepo.saveAll(dr);
				Map<String, String> filepath_map = new LinkedHashMap<String, String>();
				String refDoc = t_parameter1 + "_referencedocument";
				filepath_map.put(refDoc, "referencedocument");
				filepath_map.put(t_parameter1, "file_path");
				filepath_map.put("checksum", "file_path");
				filepath_map.put("fileonsuccess", "filepath");
				filepath_map.put("fileonerror", "filepath");
				for (String table : filepath_map.keySet()) {
					// System.out.println("table ... " + table);
					String masterDeleteApiQuery = "delete from " + table + " where " + filepath_map.get(table)
							+ " like '%" + parent_folder + "%'";
					template.update(masterDeleteApiQuery);
				}
				System.err.println("Reccord Deleted from table " + t_parameter1 + " by " + username + " on " + deletedon
						+ " having IpAddress as " + request.getRemoteAddr());
				return "success";
			} else {
				return "error";
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "error";
		}
	}

	@PostMapping("getdates")
	public List<String> getDates(@RequestParam("query") String condition, @RequestParam("table") String table) {

		try {
			// creating array for those table which do not contain dateofinterception
			// 12-06-2023
			List<String> table_doi = new ArrayList<String>();
			table_doi.add("docreader");
			table_doi.add("navxlsxmodel");
			table_doi.add("beidoumodel");

			String column = "dateofinterception";
			if (condition.contains("docreportdate") || table_doi.contains(table)) {
				column = "docreportdate";
				condition = condition.replaceAll("dateofinterception", "docreportdate");
			}
			// String.join(" ", java.util.Arrays.copyOfRange(condition.split(" "), 0, 5))
			String con = condition.split(" ")[0] + " " + condition.split(" ")[1] + " " + condition.split(" ")[2] + " "
					+ condition.split(" ")[3] + " " + condition.split(" ")[4];
			String query = "select " + column + " as date from " + table + " where " + con + ";";

			List<String> dates = new ArrayList<String>();

			for (Map<String, Object> dt : template.queryForList(query)) {
				if (!dates.contains((String) dt.get("date"))) {
					dates.add((String) dt.get("date"));
				}
			}

			return dates;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}


	// created on 31-05-2023

	@PostMapping("/getmodifiedquery")
	public List<Map<String, Object>> getmodifiedquery(@RequestParam("ticket2") String table_name, @RequestParam("column_query") String column_query,
			@RequestParam("query_date") String query_date, @RequestParam("operators") String operator,@RequestParam("condition1") String conditions) {

	
		System.out.println(column_query);
		try {
			if(column_query=="") {
				
				List<Map<String, Object>> finalL = new ArrayList<Map<String, Object>>();
				List<String> tb = new ArrayList<String>();
				
				if(query_date=="") {
					for (String le : table_name.split(",")) {
						tb.add(le);
					}
					System.out.print(tb);
					for (String b : tb) {
						try {
							String onsuccess = "";
							if(b.equals("elintxlsxmodel")) {
								
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportdate,location, * FROM " + b+" order by dateofinterception";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportdate,location, * FROM " + b + " where "+ conditions+" order by dateofinterception";
								}
							}
							else if(b.equals("navxlsxmodel")){
								if(conditions=="") {
								
								onsuccess = "SELECT * FROM " + b +" order by fromdate";
							}
							else {
								onsuccess = "SELECT * FROM " + b + " where "+ conditions+" order by fromdate";
							}
						}
							else {
									if(conditions=="") {
									
									onsuccess = "SELECT * FROM " + b;
								}
								else {
									onsuccess = "SELECT * FROM " + b + " where "+ conditions;
								}
							}
							
							System.out.println("query........" + onsuccess);
							List<Map<String, Object>> obj1 = template.queryForList(onsuccess);
							Iterator<Map<String, Object>> b1 = obj1.iterator();
							List<Map<String, Object>> finalo = new ArrayList<Map<String, Object>>();
							while (b1.hasNext()) {
								Map<String, Object> obj = b1.next();
								obj.put("table_name", b);
								finalo.add(obj);
							}
							finalL.addAll(0, finalo);
						} catch (Exception e) {
							e.printStackTrace();
						}

					}
					return finalL;
					
				}
				else if(operator.contains("between")) {
					String date_from, date_to;
					date_from = query_date.split(",")[0];
					date_to = query_date.split(",")[1];
				
					
					for (String le : table_name.split(",")) {
						tb.add(le);
					}
					System.out.print(tb + "Table name");
					for (String b : tb) {
						try {
							String onsuccess = "";
							if(b.equals("elintxlsxmodel")) {
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,location,* FROM " + b
											+ " where dateofinterception between '" + date_from + "' and '" + date_to + "'";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,location,* FROM " + b
											+ " where dateofinterception between '" + date_from + "' and '" + date_to + "'" + " and ( " + conditions+")";
									System.out.println(onsuccess);
								}
							}
							else if(b.equals("navxlsxmodel")){
								if(conditions=="") {
									onsuccess = "SELECT * FROM " + b + " where fromdate between '" + date_from + "' and '" + date_to + "' order by fromdate";
								}
								else {
									onsuccess = "SELECT * FROM " + b+ " where fromdate between '" + date_from + "' and '" + date_to + "'" + " and (" + conditions+") order by fromdate";
								}
							}
							else if(b.equals("demosample") || b.equals("groundforce") || b.equals("airvoice")) {
								if(conditions=="") {
									onsuccess = "SELECT * FROM " + b + " where dateofinterception between '" + date_from + "' and '" + date_to + "'";
								}
								else {
									onsuccess = "SELECT * FROM " + b+ " where dateofinterception between '" + date_from + "' and '" + date_to + "'" + " and (" + conditions+")";
								}
							}
							else {
								if(conditions=="") {
									onsuccess = "SELECT * FROM " + b + " where docreportdate between '" + date_from + "' and '" + date_to + "'";
								}
								else {
									onsuccess = "SELECT * FROM " + b+ " where docreportdate between '" + date_from + "' and '" + date_to + "'" + " and (" + conditions+")";
								}
							}
						
							List<Map<String, Object>> obj1 = template.queryForList(onsuccess);
							Iterator<Map<String, Object>> b1 = obj1.iterator();
							List<Map<String, Object>> finalo = new ArrayList<Map<String, Object>>();
							while (b1.hasNext()) {
								Map<String, Object> obj = b1.next();
								obj.put("table_name", b);
								finalo.add(obj);
							}
							finalL.addAll(0, finalo);
						} catch (Exception e) {
							e.printStackTrace();
						}

					}
					
					return finalL;
				}
				else {
					for (String le : table_name.split(",")) {
						tb.add(le);
					}
					System.out.print(tb);
					for (String b : tb) {
						try {
							String onsuccess = "";
							if(b.equals("elintxlsxmodel")) {
								
								if(conditions=="") {
									onsuccess = "SELECT jsonb_build_object('type','FeatureCollection','features',jsonb_agg(feature)) "
											+ "FROM (SELECT jsonb_build_object('type','Feature','id',id,'geometry',ST_AsGeoJSON(geom)::jsonb, 'properties', to_jsonb(row) - 'gid' - 'geom'  ) AS feature "
											+ "FROM (SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,location,* FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "'"+ " order by dateofinterception) row) features";
									//	+ "SELECT distinct ST_AsGeoJSON(geom)::jsonb,* FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'"+ " order by docreportdate";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,location,* FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "'"+ " and (" + conditions+") order by dateofinterception";
								}
							}
							else if(b.equals("navxlsxmodel")){
								if(conditions=="") {
									onsuccess = "SELECT * FROM " + b + " where fromdate " +operator+ " '" + query_date + "' order by fromdate";
									//	+ "SELECT distinct ST_AsGeoJSON(geom)::jsonb,* FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'"+ " order by docreportdate";
								}
								else {
									onsuccess = "SELECT * FROM " + b + " where fromdate " +operator+ " '" + query_date + "'"+ " and (" + conditions+") order by fromdate";
								}
							}
							else if(b.equals("demosample") || b.equals("groundforce") || b.equals("airvoice")){
								if(conditions=="") {
									onsuccess = "SELECT * FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "'";
									//	+ "SELECT distinct ST_AsGeoJSON(geom)::jsonb,* FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'"+ " order by docreportdate";
								}
								else {
									onsuccess = "SELECT * FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "'"+ " and (" + conditions+")";
								}
							}
							else {
								if(conditions=="") {
									onsuccess = "SELECT * FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'";
									//	+ "SELECT distinct ST_AsGeoJSON(geom)::jsonb,* FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'"+ " order by docreportdate";
								}
								else {
									onsuccess = "SELECT * FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'"+ " and (" + conditions+")";
								}
							}
							
							System.out.println("query........" + onsuccess);
							List<Map<String, Object>> obj1 = template.queryForList(onsuccess);
							Iterator<Map<String, Object>> b1 = obj1.iterator();
							List<Map<String, Object>> finalo = new ArrayList<Map<String, Object>>();
							while (b1.hasNext()) {
								Map<String, Object> obj = b1.next();
								obj.put("table_name", b);
								finalo.add(obj);
							}
							finalL.addAll(0, finalo);
						} catch (Exception e) {
							e.printStackTrace();
						}

					}
					return finalL;
				}
			}
			else {
				System.out.println("Not empty" + column_query);
				
				
				System.out.println(column_query);
				
				List<Map<String, Object>> finalL = new ArrayList<Map<String, Object>>();
				List<String> tb = new ArrayList<String>();
				
				if(query_date=="") {
					
					for (String le : table_name.split(",")) {
						tb.add(le);
					}
					System.out.print(tb);
					for (String b : tb) {
						try {
							String onsuccess = "";
							if(b.equals("elintxlsxmodel")) {
								
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,docreportnumber,docreportdate,location,template,id,"+ column_query +" as docreportnumber,docreportdate"+column_query+" FROM " + b+" order by dateofinterception";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,docreportnumber,docreportdate,location,template,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where ("+ conditions+") order by dateofinterception";
								}
							}
							else if(b.equals("navxlsxmodel")){
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,fromdate,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate"+column_query+" FROM " + b+" order by fromdate";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,fromdate,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where ("+ conditions+") order by fromdate";
								}
							}
							else {
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate"+column_query+" FROM " + b;
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where ("+ conditions+")";
								}
							}
							
							System.out.println("query........" + onsuccess);
							List<Map<String, Object>> obj1 = template.queryForList(onsuccess);
							Iterator<Map<String, Object>> b1 = obj1.iterator();
							List<Map<String, Object>> finalo = new ArrayList<Map<String, Object>>();
							while (b1.hasNext()) {
								Map<String, Object> obj = b1.next();
								obj.put("table_name", b);
								finalo.add(obj);
							}
							finalL.addAll(0, finalo);
						} catch (Exception e) {
							e.printStackTrace();
						}

					}
					return finalL;
					
				}
				else if(operator.contains("between")) {
				
					String date_from, date_to;
					date_from = query_date.split(",")[0];
					date_to = query_date.split(",")[1];
				
					
					
					for (String le : table_name.split(",")) {
						tb.add(le);
					}
					System.out.print(tb + "Table name");
					for (String b : tb) {
						try {
							String onsuccess = "";
							if(b.equals("elintxlsxmodel")) {
								
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,docreportnumber,docreportdate,location,template,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where dateofinterception between '" + date_from + "' and '" + date_to + "' order by dateofinterception";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,docreportnumber,docreportdate,location,template,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where dateofinterception between '" + date_from + "' and '" + date_to + "'" + " and (" + conditions+") order by dateofinterception";
								}
							}
							else if(b.equals("navxlsxmodel")){
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,fromdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where fromdate between '" + date_from + "' and '" + date_to + "' order by fromdate";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,fromdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where fromdate between '" + date_from + "' and '" + date_to + "'" + " and (" + conditions+") order by fromdate";
								}
							}
							else if(b.equals("demosample") || b.equals("groundforce") || b.equals("airvoice")){
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where dateofinterception between '" + date_from + "' and '" + date_to + "'";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where dateofinterception between '" + date_from + "' and '" + date_to + "'" + " and (" + conditions+")";
								}
							}
							else{
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where docreportdate between '" + date_from + "' and '" + date_to + "'";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b
											+ " where docreportdate between '" + date_from + "' and '" + date_to + "'" + " and (" + conditions+")";
								}
							}
							
						
							List<Map<String, Object>> obj1 = template.queryForList(onsuccess);
							Iterator<Map<String, Object>> b1 = obj1.iterator();
							List<Map<String, Object>> finalo = new ArrayList<Map<String, Object>>();
							while (b1.hasNext()) {
								Map<String, Object> obj = b1.next();
								obj.put("table_name", b);
								finalo.add(obj);
							}
							finalL.addAll(0, finalo);
						} catch (Exception e) {
							e.printStackTrace();
						}

					}
					
					return finalL;
				}
				else {
					for (String le : table_name.split(",")) {
						tb.add(le);
					}
					System.out.print(tb);
					for (String b : tb) {
						try {
							String onsuccess = "";
							System.out.println("temp6---------"+b=="elintxlsxmodel");
							System.out.println(b.equals("elintxlsxmodel"));
							if(b.equals("elintxlsxmodel")) {
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,docreportnumber,docreportdate,location,template,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "' order by dateofinterception";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,dateofinterception,docreportnumber,docreportdate,location,template,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "'"+ " and (" + conditions+") order by dateofinterception";
								}
								
							}
							else if(b.equals("navxlsxmodel")){
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,fromdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where fromdate " +operator+ " '" + query_date + "' order by fromdate";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,fromdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where fromdate " +operator+ " '" + query_date + "'"+ " and (" + conditions+") order by fromdate";
								}
							}
							else if(b.equals("demosample")||b.equals("groundforce")||b.equals("airvoice")){
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "'";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where dateofinterception " +operator+ " '" + query_date + "'"+ " and (" + conditions+")";
								}
							}
							else{
								if(conditions=="") {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'";
								}
								else {
									onsuccess = "SELECT distinct ST_AsGeoJSON(geom)::jsonb,docreportnumber,docreportdate,id,"+ column_query +" as docreportnumber,docreportdate,"+column_query+" FROM " + b + " where docreportdate " +operator+ " '" + query_date + "'"+ " and (" + conditions+")";
								}
							}
							System.out.println("query........" + onsuccess);
							List<Map<String, Object>> obj1 = template.queryForList(onsuccess);
							Iterator<Map<String, Object>> b1 = obj1.iterator();
							List<Map<String, Object>> finalo = new ArrayList<Map<String, Object>>();
							while (b1.hasNext()) {
								Map<String, Object> obj = b1.next();
								obj.put("table_name", b);
								finalo.add(obj);
							}
							finalL.addAll(0, finalo);
						} catch (Exception e) {
							e.printStackTrace();
						}

					}
					return finalL;
				}
				
			}
			
	
		} catch (Exception e) {
			
			e.printStackTrace();
			return null;
		}

	}

	// created on 01-06-2023----
	@PostMapping("sq_api1") // Query Builder qb_source_change
	public List<Map<String, Object>> sq_api1(@RequestParam("selected_tables") String table_names) {

		try {
			return template.queryForList(
					"select distinct column_name from information_schema.columns where table_name in (" + table_names
							+ ") and column_name not in ('geom', 'id', 'template', 'file_path', 'createddate') order by column_name");
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	// created on 28-06-2023-------
	@PostMapping("show_column_data")
	public List<Map<String, Object>> show_column_data(@RequestParam("selected_tables") String table_names,
			@RequestParam("column_names") String column_names) {

		try {
			return template.queryForList(
					"select distinct " + column_names + " from " + table_names);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}

	}

	@PostMapping("search_in_db_api")
	public List<Map<String, Object>> search_in_db() {

		try {
			String q = "select * from navxlsxmodel";
			return template.queryForList(q);

		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	JSONObject query_result;

	@GetMapping("search_by_mgcs")
	public Object search_by_mgcs() {

		Map<String, String> params = new HashMap<String, String>();
		ApiCall.CallAPIGetJsonHttp("http://172.16.20.25:7000/mgcs?query=33%2088", new ApiCall.TokenCallback() {
			@Override
			public void onSuccess(String result) {
				System.out.println(result);
				query_result = new JSONObject(result);
			}

			@Override
			public void onError(String result) {
				throw new UnsupportedOperationException("Unimplemented method 'onError'");
			}
		}, null);
		return query_result;
	}

	@GetMapping("vectordata")
	public List<Map<String, Object>> vectordata(String data, Model model) {
		try {
			String query = "SELECT jsonb_build_object('type','FeatureCollection','features',jsonb_agg(feature)) "
					+ "FROM (SELECT jsonb_build_object('type','Feature','id',id,'geometry',ST_AsGeoJSON(geom)::jsonb, 'properties', to_jsonb(row) - 'gid' - 'geom'  ) AS feature "
					+ "FROM (SELECT * FROM navxlsxmodel  where nameofvessel ~* 'DDG 171' and geom is not null order by docreportdate asc) row) features";
			System.out.println("query... " + query);
			List<Map<String, Object>> list = template.queryForList(query);
			return list;
		} catch (Exception e) {
			return null;
		}
	}

	Map res = new HashMap();

	@GetMapping("mgcs/{query}")
	public Map mgcs(@PathVariable String query) throws UnsupportedEncodingException {
		Map<String, String> params = new HashMap<String, String>();

		ApiCall.CallAPIGetJsonHttp("http://172.16.20.25:7000/mgcs?query=" + URLEncoder.encode(query, "UTF-8"),
				new ApiCall.TokenCallback() {

					@Override
					public void onSuccess(String result) {
						res = new Gson().fromJson(result, Map.class);

					}

					@Override
					public void onError(String result) {
						System.out.println(result);
					}

				}, params);
		return res;
	}

	@PostMapping("show_column_dropdown")
	public List<Map<String, Object>> show_column_dropdown(@RequestParam("selected_tables") String selected_tables,
			@RequestParam("column_names") String column_names,
			@RequestParam("query_date") String query_date,
			@RequestParam("condition_operator") String condition_operator) {
		List<Map<String, Object>> obj1 = new ArrayList<Map<String, Object>>();

		if (query_date == "") {
			String q = "select distinct " + column_names + " from " + selected_tables + " where " + column_names
					+ " is not null";
			System.out.println(q);
			obj1 = template.queryForList(q);
		} else {
			if (condition_operator.contains("between")) {
				String date_from, date_to;
				date_from = query_date.split(",")[0];
				date_to = query_date.split(",")[1];
				if (selected_tables.equals("elintxlsxmodel") || selected_tables.equals("demosample")
						|| selected_tables.equals("groundforce") || selected_tables.equals("airvoice")) {
					String q = "select distinct " + column_names + " from " + selected_tables + " where " + column_names
							+ " is not null and dateofinterception between '" + date_from + "' and '" + date_to + "'";
					System.out.println(q);
					obj1 = template.queryForList(q);
				} else if (selected_tables.equals("navxlsxmodel")) {
					String q = "select distinct " + column_names + " from " + selected_tables + " where " + column_names
							+ " is not null and fromdate between '" + date_from + "' and '" + date_to + "'";
					System.out.println(q);
					obj1 = template.queryForList(q);
				} else {
					String q = "select distinct " + column_names + " from " + selected_tables + " where " + column_names
							+ " is not null and docreportdate between '" + date_from + "' and '" + date_to + "'";
					System.out.println(q);
					obj1 = template.queryForList(q);
				}
			} else {
				if (selected_tables.equals("elintxlsxmodel") || selected_tables.equals("demosample")
						|| selected_tables.equals("groundforce") || selected_tables.equals("airvoice")) {
					String q = "select distinct " + column_names + " from " + selected_tables + " where " + column_names
							+ " is not null and dateofinterception " + condition_operator + "'" + query_date + "'";
					System.out.println(q);
					obj1 = template.queryForList(q);
				} else if (selected_tables.equals("navxlsxmodel")) {
					String q = "select distinct " + column_names + " from " + selected_tables + " where " + column_names
							+ " is not null and fromdate " + condition_operator + "'" + query_date + "'";
					System.out.println(q);
					obj1 = template.queryForList(q);
				} else {
					String q = "select distinct " + column_names + " from " + selected_tables + " where " + column_names
							+ " is not null and docreportdate " + condition_operator + "'" + query_date + "'";
					System.out.println(q);
					obj1 = template.queryForList(q);
				}

			}
		}
		// System.out.println(template.queryForList(q));
		return obj1;
	}
}
