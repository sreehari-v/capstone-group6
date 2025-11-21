import React, { useEffect, useState } from "react";
import axios from "axios";

const Medication = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMeds, setFilteredMeds] = useState([]);
  const [sortFilter, setSortFilter] = useState("All");
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    schedule: "",
    time: "",
    beforeFood: false,
  });
  const [editId, setEditId] = useState(null);

  // const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    const order = ["Morning", "Afternoon", "Evening", "Night"];
    let sorted = [...medicines];

    if (sortFilter !== "All") {
      sorted = medicines.filter((m) => m.schedule === sortFilter);
    } else {
      sorted.sort(
        (a, b) => order.indexOf(a.schedule) - order.indexOf(b.schedule)
      );
    }

    setFilteredMeds(sorted);
  }, [sortFilter, medicines]);

  // const fetchMedicines = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5000/api/medicines");
  //     setMedicines(res.data);
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //   }
  // };

    const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medicines", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSortChange = (e) => {
    const selected = e.target.value;
    setSortFilter(selected);

    if (selected === "All") {
      setFilteredMeds(medicines);
    } else {
      setFilteredMeds(medicines.filter((m) => m.schedule === selected));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleScheduleChange = (value) => {
    setForm({ ...form, schedule: value }); // only one selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.schedule || !form.time)
      return alert("Please fill all fields");

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/medicines/${editId}`,
        form,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
        );
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/medicines", 
        form,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }
      setForm({
        name: "",
        dosage: "",
        schedule: "",
        time: "",
        beforeFood: false,
      });
      fetchMedicines();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/medicines/${id}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchMedicines();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (med) => {
    setForm({
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule,
      time: med.time,
      beforeFood: med.beforeFood,
    });
    setEditId(med._id);
  };

  return (
    <div
      className="layout-content-container flex flex-col max-w-[960px] w-full flex-1 overflow-y-auto"
    >
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Medication
        </p>
      </div>

      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d171b] tracking-light text-[24px] font-bold leading-tight min-w-72">
          {editId ? "Edit Medicine" : "Add Medicine"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-4 px-4 py-3 max-w-[480px]">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="pb-2 font-medium">Medicine Name*</p>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter medicine name"
              className="rounded-lg h-14 bg-[#e7eff3] p-4"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 px-4 py-3 max-w-[480px]">
          <label className="flex flex-col flex-1">
            <p className="pb-2 font-medium">Dosage*</p>
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="Enter dosage"
              className="rounded-lg h-14 bg-[#e7eff3] p-4"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 px-4 py-3 max-w-[480px]">
          <p className="pb-2 font-medium w-full">Schedule*</p>
          {["Morning", "Afternoon", "Evening", "Night"].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.schedule === opt}
                onChange={() => handleScheduleChange(opt)}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 px-4 py-3 max-w-[480px]">
          <label className="flex flex-col flex-1">
            <p className="pb-2 font-medium">Time*</p>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="rounded-lg h-14 bg-[#e7eff3] p-4"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 px-4 py-3 max-w-[480px]">
          <p className="pb-2 font-medium w-full">Take Before Food?</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="beforeFood"
              checked={form.beforeFood}
              onChange={handleChange}
            />
            {form.beforeFood ? "Yes (Before Food)" : "No (After Food)"}
          </label>
        </div>

        <div className="flex px-4 py-3 justify-end">
          <button
            type="submit"
            className="bg-[#1193d4] text-white px-4 py-2 rounded-lg font-bold"
          >
            {editId ? "Update Medicine" : "Add Medicine"}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between px-4 mt-8">
        <h2 className="text-[22px] font-bold">Scheduled Medications</h2>
        <div className="flex items-center gap-2">
          <label className="font-medium text-sm text-[#0d171b]">
            Sort by Schedule:
          </label>
          <select
            value={sortFilter}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          >
            <option value="All">All</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
      </div>
      <div className="px-4 py-3">
        <table className="w-full border border-[#cfdfe7] rounded-lg">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Medication</th>
              <th className="px-4 py-3 text-left">Dosage</th>
              <th className="px-4 py-3 text-left">Schedule</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Before Food</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeds.map((med) => (
              <tr key={med._id} className="border-t">
                <td className="px-4 py-2">{med.name}</td>
                <td className="px-4 py-2">{med.dosage}</td>
                <td className="px-4 py-2">{med.schedule}</td>
                <td className="px-4 py-2">{med.time}</td>
                <td className="px-4 py-2">
                  {med.beforeFood ? "Before Food" : "After Food"}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(med)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(med._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredMeds.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No medicines found for{" "}
                  {sortFilter === "All" ? "any schedule" : sortFilter}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medication;
