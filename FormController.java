package shipTable.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class FormController {

	@Autowired
	JdbcTemplate template;

	@GetMapping("/")
	public String home(Model model) {
		return new String("shipform");
	}

	@GetMapping("/api/getShips")
	@ResponseBody
	public List<Map<String, Object>> getShips() {
		return template.queryForList("SELECT shipname FROM public.myship");
	}
	@PostMapping("/api/getShipTotal")
	@ResponseBody
	public List<Map<String, Object>> getShipTotal() {
		List<Map<String, Object>> remaining = template.queryForList("SELECT * FROM public.shipremaining");

		if (remaining.size() > 0){
			return template.queryForList("SELECT remaining as total FROM public.shipremaining");
		}
		return template.queryForList("SELECT total FROM public.myship");
	}
}
